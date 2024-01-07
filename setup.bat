cd wiz-react

call npm install

call npm run build



@echo on

cd ..\WiZ_FastAPI

python -m venv venv

call .\venv\Scripts\activate.bat

pip install -r requirements.txt

pause