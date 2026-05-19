import React, { useEffect, useState } from "react";

export default function MercadoPagoBrick({ amount = 100 }) {
  const [pagoExitoso, setPagoExitoso] = useState(false);

  useEffect(() => {
    let brickController = null;
    const containerId = `paymentBrick_container_${amount}`;

    const loadMercadoPagoSDK = () => {
      return new Promise((resolve, reject) => {
        if (window.MercadoPago) {
          resolve();
          return;
        }

        const existingScript = document.querySelector(
          'script[src="https://sdk.mercadopago.com/js/v2"]'
        );

        if (existingScript) {
          existingScript.onload = resolve;
          existingScript.onerror = reject;
          return;
        }

        const script = document.createElement("script");
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const loadBrick = async () => {
      try {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = "";

        await loadMercadoPagoSDK();

        const keyResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/payments/public-key`
        );

        if (!keyResponse.ok) {
          throw new Error("No se pudo obtener la Public Key");
        }

        const { publicKey } = await keyResponse.json();

        const mp = new window.MercadoPago(publicKey, {
          locale: "es-PE",
        });

        const bricksBuilder = mp.bricks();

        brickController = await bricksBuilder.create(
          "payment",
          containerId,
          {
            initialization: {
              amount: Number(amount),
              payer: {
                email: "test@test.com",
                firstName: "APRO",
                lastName: "",
              },
            },
            customization: {
              visual: {
                style: {
                  theme: "default",
                },
              },
              paymentMethods: {
                creditCard: "all",
                debitCard: "all",
                maxInstallments: 1,
              },
            },
            callbacks: {
              onReady: () => {
                console.log("Payment Brick listo");
              },

              onSubmit: async ({ formData }) => {
                try {
                  const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/payments/process-payment`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(formData),
                    }
                  );

                  const data = await response.json();
                  console.log("RESPUESTA BACKEND:", data);

                  if (!response.ok) {
                    alert(
                      "Error en el pago: " +
                        JSON.stringify(data.detail || data)
                    );
                    return;
                  }

                  const paymentStatus =
                    data?.response?.status || data?.status || "desconocido";

                  if (paymentStatus === "approved") {
                    setPagoExitoso(true);
                  } else if (paymentStatus === "rejected") {
                    alert("Pago rechazado");
                  } else if (paymentStatus === "pending") {
                    alert("Pago pendiente");
                  } else {
                    alert(`Estado del pago: ${paymentStatus}`);
                  }
                } catch (error) {
                  console.error("Error procesando pago:", error);
                  alert("Error inesperado procesando el pago");
                }
              },

              onError: (error) => {
                console.error("Error Payment Brick:", error);
              },
            },
          }
        );
      } catch (error) {
        console.error("Error cargando Payment Brick:", error);
      }
    };

    loadBrick();

    return () => {
      if (brickController) {
        brickController.unmount();
      }

      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [amount]);

  return (
    <>
      <div id={`paymentBrick_container_${amount}`}></div>

      {pagoExitoso && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-[380px] text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-4xl">✓</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              Pago aprobado
            </h2>

            <p className="text-gray-600 mt-2">
              Tu pago fue procesado correctamente.
            </p>

            <button
              onClick={() => setPagoExitoso(false)}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}