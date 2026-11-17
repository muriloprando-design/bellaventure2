
const apiKey = document.getElementById("apiKey");
const mensagem = document.getElementById("mensagem");
const btnEnviar = document.getElementById("btnEnviar");
const chatContainer = document.getElementById("chatContainer");
const status = document.getElementById("status");

let historico = [];

async function enviarMensagem() {

    const chave = apiKey.value.trim();
    const texto = mensagem.value.trim();

    if (!chave) {
        alert("Por favor, insira sua chave da API!");
        return;
    }

    if (!texto) {
        alert("Digite uma mensagem!");
        return;
    }

    adicionarMensagem(texto, "usuario");

    mensagem.value = "";

    btnEnviar.disabled = true;
    status.textContent = "Bellaventure está preparando sua resposta...";

    historico.push({
        role: "user",
        content: texto
    });

    try {

        const resposta = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${chave}`
                },

                body: JSON.stringify({
                    model: "gpt-5.5",

                    instructions: `
                        Você é o assistente virtual oficial da Bellaventure,
                        uma agência de viagens de luxo.

                        Sua comunicação deve ser elegante, educada,
                        sofisticada e acolhedora.

                        A Bellaventure oferece experiências exclusivas,
                        hotéis históricos, palácios, gastronomia refinada
                        e destinos internacionais.

                        Seu objetivo é ajudar clientes com dúvidas sobre
                        viagens, destinos, experiências e serviços turísticos.

                        Nunca invente preços, reservas ou informações
                        sobre pacotes que não foram fornecidos.

                        Responda sempre em português do Brasil.
                    `,

                    input: historico
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.error?.message || "Erro ao conectar com a API."
            );
        }

        const respostaTexto = (dados.output || [])
            .filter(item => item.type === "message")
            .flatMap(item => item.content || [])
            .filter(item => item.type === "output_text")
            .map(item => item.text)
            .join("\n");

        if (!respostaTexto) {
            throw new Error("A API não retornou uma resposta de texto.");
        }

        historico.push({
            role: "assistant",
            content: respostaTexto
        });

        adicionarMensagem(respostaTexto, "bot");

        status.textContent = "";

    } catch (erro) {

        console.error(erro);

        status.textContent = "Não foi possível realizar o atendimento.";

        adicionarMensagem(
            "Desculpe, ocorreu um erro: " + erro.message,
            "bot"
        );

        historico.pop();

    } finally {

        btnEnviar.disabled = false;
        mensagem.focus();

    }
}

function adicionarMensagem(texto, tipo) {

    const div = document.createElement("div");

    div.classList.add("mensagem", tipo);

    div.textContent = texto;

    chatContainer.appendChild(div);

    chatContainer.scrollTop = chatContainer.scrollHeight;
}

btnEnviar.addEventListener("click", enviarMensagem);

mensagem.addEventListener("keydown", function(event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        enviarMensagem();

    }

});
