import io
import os

import requests
from PIL import Image


def resize_image(input_path, size: tuple = (64, 64), image=None):
    """Resize image to given size"""

    if input_path.startswith('http'):
        image = Image.open(requests.get(input_path, stream=True).raw)
    else:
        if os.path.isfile(input_path):
            image = Image.open(input_path)

    res = image.resize(size,  Image.Resampling.LANCZOS)

    output_buffer = io.BytesIO()
    res.save(output_buffer, format="JPEG")  # You can change the format as needed
    output_buffer.seek(0)
    return output_buffer
