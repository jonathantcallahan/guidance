from typing import Dict, List, Any
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer

class EndpointHandler():
    def __init__(self, path=""):
        # load the model for text generation
        model = AutoModelForCausalLM.from_pretrained(path)
        tokenizer = AutoTokenizer.from_pretrained(path)
        # create inference pipeline
        self.pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)

    def __call__(self, data: Any) -> List[Dict[str, Any]]:
        """
        Args:
            data (:obj:`dict`):
                includes the input data and the parameters for the inference.
        Return:
            A :obj:`list`:. The object returned should be a list like [{"generated_text": "The generated text"}] containing:
                - "generated_text": A string representing the generated text.
        """
        inputs = data.pop("inputs", data)
        parameters = data.pop("parameters", None)

        # pass inputs with all kwargs in data
        if parameters is not None:
            prediction = self.pipeline(inputs, **parameters)
        else:
            prediction = self.pipeline(inputs)
        
        # postprocess the prediction
        return prediction
