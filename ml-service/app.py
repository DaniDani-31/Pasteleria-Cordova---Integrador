from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

from modelo import entrenar_modelo, predecir_demanda

app = FastAPI(
    title="ML Pastelería Córdova",
    description="Servicio de Machine Learning para predicción de demanda",
    version="1.0.0"
)

# Permitir solicitudes desde Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SPRING_URL = "http://localhost:8080/api/ml/ventas/dataset"


@app.get("/")
def inicio():
    return {
        "mensaje": "Servicio ML de Pastelería Córdova funcionando"
    }


@app.get("/ventas/dataset")
def obtener_dataset():

    respuesta = requests.get(SPRING_URL)

    if respuesta.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail="No se pudo obtener el dataset desde Spring Boot"
        )

    return respuesta.json()


@app.get("/ventas/prediccion/{id_producto}")
def predecir_venta(id_producto: int):

    respuesta = requests.get(SPRING_URL)

    if respuesta.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail="No se pudo obtener el historial de ventas"
        )

    data = respuesta.json()

    try:

        modelo, df = entrenar_modelo(data)

        resultado = predecir_demanda(
            modelo,
            df,
            id_producto
        )

        return resultado

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )