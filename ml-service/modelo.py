import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestRegressor


def preparar_datos(data):

    df = pd.DataFrame(data)

    if df.empty:
        raise ValueError("No existen datos de ventas para entrenar el modelo.")

    df["fecha"] = pd.to_datetime(df["fecha"])

    # Variables temporales
    df["dia_semana"] = df["fecha"].dt.dayofweek
    df["dia_mes"] = df["fecha"].dt.day
    df["mes"] = df["fecha"].dt.month

    return df


def entrenar_modelo(data):

    df = preparar_datos(data)

    X = df[
        [
            "idProducto",
            "dia_semana",
            "dia_mes",
            "mes"
        ]
    ]

    y = df["cantidadVendida"]

    modelo = RandomForestRegressor(
        n_estimators=100,
        random_state=42
    )

    modelo.fit(X, y)

    return modelo, df



def predecir_demanda(modelo, df, id_producto):

    producto = df[df["idProducto"] == id_producto]

    # Si el producto tiene historial, utilizar el modelo ML
    if not producto.empty:

        ultima_fecha = producto["fecha"].max()
        tiene_historial = True

    else:
        # Si no tiene historial, usar una estimación de respaldo
        # basada en las ventas disponibles.
        ultima_fecha = df["fecha"].max()
        tiene_historial = False

    fecha_prediccion = ultima_fecha + pd.Timedelta(days=1)

    if tiene_historial:

        entrada = pd.DataFrame([
            {
                "idProducto": id_producto,
                "dia_semana": fecha_prediccion.dayofweek,
                "dia_mes": fecha_prediccion.day,
                "mes": fecha_prediccion.month
            }
        ])

        prediccion = modelo.predict(entrada)[0]
        metodo = "machine_learning"

    else:

        prediccion = df["cantidadVendida"].mean()
        metodo = "promedio_general_sin_historial"

    return {
        "idProducto": int(id_producto),
        "fechaPrediccion": fecha_prediccion.strftime("%Y-%m-%d"),
        "demandaPredicha": round(max(0, float(prediccion)), 2),
        "tieneHistorial": tiene_historial,
        "metodoPrediccion": metodo
    }
