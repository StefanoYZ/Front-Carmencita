import React, { useState } from "react";
import Button from "../components/common/Button.jsx";
import Card from "../components/common/Card.jsx";
import Input from "../components/common/Input.jsx";
import { cotizacionService } from "../services/cotizacion.service.js";
import MercadoPagoBrick from "../components/payments/MercadoPagoBrick.jsx";
import YapePayment from "../components/payments/YapePayment.jsx";

function Cotizacion() {
  const [form, setForm] = useState({
    peso: "",
    largo: "",
    ancho: "",
    alto: "",
    destino: "",
  });

  const [result, setResult] = useState(null);
  const [metodoPago, setMetodoPago] = useState("tarjeta");

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await cotizacionService.calcular(form);
    console.log("RESULTADO COTIZACION:", response);

    setResult(response);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Cotización</h2>
        <p className="page-subtitle">
          Cálculo referencial de tarifa en soles.
        </p>
      </div>

      <Card>
        <form
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"
          onSubmit={handleSubmit}
        >
          <Input
            label="Peso (kg)"
            name="peso"
            type="number"
            min="0"
            step="0.1"
            value={form.peso}
            onChange={updateField}
            required
          />

          <Input
            label="Largo (cm)"
            name="largo"
            type="number"
            min="0"
            value={form.largo}
            onChange={updateField}
            required
          />

          <Input
            label="Ancho (cm)"
            name="ancho"
            type="number"
            min="0"
            value={form.ancho}
            onChange={updateField}
            required
          />

          <Input
            label="Alto (cm)"
            name="alto"
            type="number"
            min="0"
            value={form.alto}
            onChange={updateField}
            required
          />

          <Input
            label="Destino"
            name="destino"
            value={form.destino}
            onChange={updateField}
            required
          />

          <div className="md:col-span-2 xl:col-span-5">
            <Button type="submit">Calcular tarifa</Button>
          </div>
        </form>
      </Card>

      {result && (
        <>
          <Card className="border-green-200 bg-green-50">
            <p className="text-sm text-green-700">Tarifa simulada</p>

            <strong className="mt-2 block text-3xl text-brand-black">
              {result.montoFormateado}
            </strong>

            <p className="mt-1 text-sm text-gray-600">
              Peso facturable: {result.pesoFacturable} kg
            </p>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold">Realizar pago</h3>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <button
                type="button"
                onClick={() => setMetodoPago("tarjeta")}
                className={`rounded-xl border p-4 text-left transition ${
                  metodoPago === "tarjeta"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-semibold">Tarjeta</p>
                    <p className="text-sm text-gray-500">
                      Crédito o débito
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago("yape")}
                className={`rounded-xl border p-4 text-left transition ${
                  metodoPago === "yape"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="font-semibold text-purple-700">Yape</p>
                    <p className="text-sm text-gray-500">
                      Celular + código de aprobación
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {metodoPago === "tarjeta" && (
              <div>
                <h4 className="mb-3 font-medium">Pago con tarjeta</h4>
                  <MercadoPagoBrick
                    key={`mp-${metodoPago}-${result.monto}`}
                    amount={Number(result.monto)}
                  />
              </div>
            )}

            {metodoPago === "yape" && (
              <div>
                <h4 className="mb-3 font-medium text-purple-700">
                  Pago con Yape
                </h4>
                <YapePayment amount={Number(result.monto)} />
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

export default Cotizacion;
