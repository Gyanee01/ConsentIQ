# AMD ROCm Setup Guide for Local NLP Inference

This guide explains how to configure your AMD GPU with ROCm to run the ConsentIQ NLP microservice locally without relying on paid APIs.

## Prerequisites
- A compatible AMD GPU (e.g., Radeon RX 6000/7000 series, Instinct MI series).
- Linux operating system (Ubuntu 20.04 or 22.04 recommended).

## Step 1: Install AMD ROCm
1. Add the AMD ROCm repository and install the drivers.
   ```bash
   sudo apt update
   sudo apt install -y "linux-headers-$(uname -r)" "linux-modules-extra-$(uname -r)"
   wget https://repo.radeon.com/amdgpu-install/5.7/ubuntu/jammy/amdgpu-install_5.7.50700-1_all.deb
   sudo apt install ./amdgpu-install_5.7.50700-1_all.deb
   sudo amdgpu-install --usecase=rocm,hip,mivisionx
   ```
2. Add your user to the `video` and `render` groups:
   ```bash
   sudo usermod -a -G video $USER
   sudo usermod -a -G render $USER
   ```
3. Reboot your system.

## Step 2: Install PyTorch for ROCm
To use HuggingFace Transformers with hardware acceleration, you need the ROCm-specific build of PyTorch.

1. Create a Python virtual environment:
   ```bash
   python3 -m venv consent-iq-env
   source consent-iq-env/bin/activate
   ```
2. Install PyTorch with ROCm support (check pytorch.org for the latest version):
   ```bash
   pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.6
   ```
3. Verify the installation:
   ```python
   import torch
   print(torch.cuda.is_available()) # Should print True
   print(torch.version.hip) # Should print the ROCm version
   ```

## Step 3: Run the NLP Microservice
1. Install the required Python packages:
   ```bash
   pip install fastapi uvicorn transformers pydantic
   ```
2. Start the FastAPI server (see `python-nlp/main.py`):
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

The ConsentIQ Node.js backend will now be able to send privacy policy text to `http://localhost:8000/analyze` for local, cost-free inference!
