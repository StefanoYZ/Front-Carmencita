import React, { useState } from "react";

export default function YapePayment({ amount = 100 }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const loadMercadoPagoSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.MercadoPago) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  const handleYapePayment = async () => {
    try {
      setLoading(true);
      setResultado(null);

      await loadMercadoPagoSDK();

      const keyResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/public-key`
      );

      const { publicKey } = await keyResponse.json();

      const mp = new window.MercadoPago(publicKey, {
        locale: "es-PE",
      });

      const yape = mp.yape({
        otp,
        phoneNumber,
      });

      const yapeToken = await yape.create();

      console.log("TOKEN YAPE:", yapeToken);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/yape/process-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: yapeToken.id,
            amount: Number(amount),
            email: "test@test.com",
          }),
        }
      );

      const data = await response.json();

      console.log("RESPUESTA BACKEND YAPE:", data);

      const status = data?.status || data?.data?.status;

      if (status === "approved") {
        setResultado("approved");
      } else {
        setResultado("rejected");
      }
    } catch (error) {
      console.error("Error pagando con Yape:", error);
      setResultado("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-purple-700">
        Pagar con Yape
      </h2>

      <label className="block mb-2 font-medium">Celular asociado a Yape</label>
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Ej: Ingresa tu número Yape"
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />

      <label className="block mb-2 font-medium">Código de aprobación</label>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Ej: 123456"
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />

      <p className="text-sm text-gray-500 mb-4">
        Abre tu app Yape, genera tu código de aprobación e ingrésalo aquí
      </p>

      <button
        onClick={handleYapePayment}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-60"
      >
        {loading ? "Procesando..." : "Pagar con Yape"}
      </button>

      {resultado === "approved" && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg text-center font-semibold">
          Pago con Yape aprobado
        </div>
      )}

      {resultado === "rejected" && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-center font-semibold">
          Pago con Yape rechazado
        </div>
      )}

      {resultado === "error" && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-center font-semibold">
          Error procesando el pago
        </div>
      )}
    </div>
  );
}