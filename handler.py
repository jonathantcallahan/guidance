from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from accelerate import Accelerator
from safetensors.torch import load_file
import os

class EndpointHandler:
    def __init__(self, path=""):

        accelerator = Accelerator()

        model = AutoModelForCausalLM.from_pretrained(path)
        tokenizer = AutoTokenizer.from_pretrained(path)

        state_dict = load_file(os.path.join(path, "adapter_model.safetensors"))
        model.load_state_dict(state_dict, strict=False)

        model = accelerator.prepare(model)

        self.pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)

    def __call__(self, data):
        inputs = data.pop("inputs", data)
        parameters = data.pop("parameters", None)
        if parameters is not None:
            prediction = self.pipeline(inputs, **parameters)
        else:
            prediction = self.pipeline(inputs)
        return prediction