use serde::{Deserialize, Serialize};

use crate::message::Message;

#[derive(Debug, Deserialize)]
pub struct ExtractRequest {
    pub messages: Vec<Message>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExtractResponse {
    pub items: Vec<ExtractedItem>,
}

/// The four entity types named in problem-statement.md §5. `sourceMessageIds`
/// is non-negotiable on every variant — it's what the deep-link-to-source-message
/// trust story depends on.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ExtractedItem {
    Task {
        text: String,
        #[serde(default)]
        assignee: Option<String>,
        source_message_ids: Vec<String>,
    },
    Decision {
        text: String,
        source_message_ids: Vec<String>,
    },
    OpenQuestion {
        text: String,
        source_message_ids: Vec<String>,
    },
    Idea {
        text: String,
        source_message_ids: Vec<String>,
    },
}
