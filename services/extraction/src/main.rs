mod entities;
mod llm;
mod message;

use std::sync::Arc;

use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};

use entities::{ExtractRequest, ExtractResponse};
use llm::{LlmClient, LlmError};

#[derive(Clone)]
struct AppState {
    llm: Arc<LlmClient>,
}

#[tokio::main]
async fn main() {
    // Loads ../../.env (repo root) for local dev; no-op if the file is absent,
    // e.g. in production where env vars are set by the hosting platform.
    dotenvy::from_filename("../../.env").ok();
    tracing_subscriber::fmt::init();

    let api_key = std::env::var("OPENROUTER_API_KEY")
        .expect("OPENROUTER_API_KEY must be set — see .env.example");
    let model =
        std::env::var("OPENROUTER_MODEL").unwrap_or_else(|_| "openai/gpt-oss-20b:free".to_string());

    let state = AppState {
        llm: Arc::new(LlmClient::new(api_key, model)),
    };

    let app = Router::new()
        .route("/health", get(health))
        .route("/extract", post(extract))
        .with_state(state);

    let port = std::env::var("EXTRACTION_SERVICE_PORT").unwrap_or_else(|_| "8080".to_string());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .expect("failed to bind port");

    tracing::info!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.expect("server error");
}

async fn health() -> &'static str {
    "ok"
}

/// This is the whole service's one real job: batch in, strict schema-validated
/// entities out. Never persists message content — see docs/security/threat-model.md.
async fn extract(
    State(state): State<AppState>,
    Json(request): Json<ExtractRequest>,
) -> Result<Json<ExtractResponse>, (StatusCode, String)> {
    state
        .llm
        .extract(&request)
        .await
        .map(Json)
        .map_err(|error| match error {
            LlmError::Request(_) => (
                StatusCode::BAD_GATEWAY,
                "extraction backend unreachable".to_string(),
            ),
            LlmError::NoCompletion => (
                StatusCode::BAD_GATEWAY,
                "extraction backend returned no completion".to_string(),
            ),
            LlmError::InvalidShape(detail) => (
                StatusCode::BAD_GATEWAY,
                format!("extraction backend returned invalid output after retry: {detail}"),
            ),
        })
}
