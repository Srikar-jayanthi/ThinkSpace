class ModelStore:
    # sentence_model removed for lightweight footprint — TF-IDF used instead
    sentence_model = None
    logic_model = None
    evidence_model = None
    clarity_model = None


model_store = ModelStore()
