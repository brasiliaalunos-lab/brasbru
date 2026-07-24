let nomeUsuario = "";

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        try { localStorage.removeItem('quiz_nome'); } catch (e) { /* ignore */ }
        alert("Você saiu!");
        reiniciarQuiz();
    });
}

const paginaAtual = window.location.pathname.split("/").pop() || "quiz.html";
const hrefLower = window.location.href.toLowerCase();
const isQuizPage = paginaAtual === "quiz.html" || hrefLower.includes("quiz.html");

if (isQuizPage) {
    const nomeSalvo = localStorage.getItem('quiz_nome');
    if (nomeSalvo && nomeSalvo.trim()) {
        nomeUsuario = nomeSalvo;
     
        const nomeInputEl = document.getElementById('entrada-nome');
        if (nomeInputEl) nomeInputEl.value = nomeSalvo;
    }
}

const perguntas = [
{ pergunta: "quem criou o roblox?", opcoes: ["A}vietnamita 111dots Studio ", "B}David Baszucki e Erik Cassel", "C}Fernando Henrique Cardoso ", "D}William George Morgan"], resposta: "B}David Baszucki e Erik Cassel"},
{ pergunta: "a musicar 777 666 e de? ", opcoes: ["A}matue", "B}henrique e juliano", "C}mc rian sp", "D}hungria"], resposta: "A}matue" },
{ pergunta: "quem criou o youtube?", opcoes: ["A} Chad Hurley, Steve Chen e Jawed Karim", "B} Bill Gates", "C}Steve Jobs", "D}Mark Zuckerberg"], resposta: "A}Chad Hurley, Steve Chen e Jawed Karim" },
{ pergunta: "quem criou o google?", opcoes: ["A}Larry Page e Sergey Brin", "B}marilia mendonça", "C}Chad Hurley, Steve Chen e Jawed Karim", "D}Ebenezer Cobb Morley"], resposta: "A}Larry Page e Sergey Brin" },
{ pergunta: " quem criou a musica 67? ", opcoes: ["A}Skrilla", "B}matue", "C}henrique e juliano", "D}mc rian sp"], resposta: "A}Skrilla" },
{ pergunta: "a musica maquina do tempo quem criou", opcoes: ["A}matue", "B}Brincon", "C}tribo da periferia;", "D}racionais"], resposta: "A}matue" },
{ pergunta: "quem criou o bolsa escola?", opcoes: ["A}Fernando Haddad", "B}Fernando Henrique Cardoso", "C}Karl Benz", "D}Gottlieb Daimler e Wca sexta-feira quem e o criador"], resposta:"Fernando Hadadd"},
{ pergunta: "kkkkkkk", opcoes: ["A}Adan Lellis", "B}hunria", "C}rincon", "D}yago oproprio"], resposta: "A}Adan Lellis" },
{ pergunta: "a musica voando baixo quem feis", opcoes: ["A}rincon", "B}matue", "natanzinho", "marcus"], resposta: "natanzinho" },
{ pergunta:" qual o nome do artista que canta a musica 777 666? ", opcoes: ["A}matue", "B}henrique e juliano", "C}mc rian sp", "D}hungria"], resposta: "matue" },
{ pergunta: "a musica nosso juramento quem criou", opcoes: ["A}mainha dobrega", "B}natanzinho", "C}rincon", "D}henrique"], resposta: "A}mainha dobrega" },
{ pergunta: "", opcoes: ["", "", "", "o mome o pofessor", "pedro"], resposta: "pedro" }

];
    
let indiceAtual = 0;
let acertos = 0;
let erros = 0;
let respostasDadas = [];
let historicoRespostas = [];

const somAcertou = document.getElementById('som-acertou');
const somErrou = document.getElementById('som-errou');
const somSucesso = document.getElementById('som-sucesso');
const somDerrota = document.getElementById('som-derrota');

function tocarSom(elementoAudio, duracao = 2) {
    if (!elementoAudio) return;
    elementoAudio.currentTime = 0;
    elementoAudio.play();
    setTimeout(() => elementoAudio.pause(), duracao * 1000);
}

function atualizarBarraProgresso() {
    const porcentagem = (indiceAtual / perguntas.length) * 100;
    const barra = document.getElementById('barra-progresso');
    if (barra) barra.style.width = `${porcentagem}%`;
}

function iniciarQuiz() {
    const nomeInput = document.getElementById('entrada-nome');
    const errorMessage = document.getElementById('mensagem-erro');
    const nomeDigitado = nomeInput ? nomeInput.value.trim() : '';

    if (!nomeDigitado) {
        if (errorMessage) {
            errorMessage.textContent = 'Por favor, digite um nome para começar!';
            errorMessage.classList.remove('oculto');
        }
        if (nomeInput) nomeInput.classList.add('entrada-erro');
        return;
    }

    nomeUsuario = nomeDigitado;
    try { localStorage.setItem('quiz_nome', nomeUsuario); } catch (e) { /* ignore */ }

    acertos = 0;
    erros = 0;
    indiceAtual = 0;
    respostasDadas = new Array(perguntas.length).fill(false);
    historicoRespostas = [];

    const containerInicio = document.getElementById('container-inicio');
    const resultado = document.getElementById('resultado');
    const quiz = document.getElementById('quiz');
    const quizPrincipal = document.getElementById('quiz-principal');

    if (containerInicio) containerInicio.classList.add('oculto');
    if (resultado) resultado.classList.add('oculto');
    if (quiz) quiz.classList.remove('oculto');
    if (quizPrincipal) quizPrincipal.classList.remove('oculto');

    const barra = document.getElementById('barra-progresso');
    if (barra) barra.style.width = '0%';

    carregarPergunta();
}

function carregarPergunta() {
    atualizarBarraProgresso();

    const botaoVoltar = document.getElementById('botao-voltar');
    const proximoBtn = document.getElementById('botao-proximo');
    const feedbackMessage = document.getElementById('mensagem-feedback');
    const perguntaEl = document.getElementById("pergunta");
    const opcoesContainer = document.getElementById("opcoes");

    if (!perguntaEl || !opcoesContainer || !proximoBtn) return;

    if (botaoVoltar) {
        botaoVoltar.style.display = indiceAtual === 0 ? 'none' : 'inline-block';
    }

    proximoBtn.textContent = 'Verificar';
    proximoBtn.onclick = verificarResposta;

    if (feedbackMessage) {
        feedbackMessage.innerHTML = "";
        feedbackMessage.className = '';
    }

    const perguntaAtual = perguntas[indiceAtual];
    perguntaEl.textContent = perguntaAtual.pergunta;

    opcoesContainer.innerHTML = "";
    opcoesContainer.classList.remove("opcoes-desabilitadas");

    perguntaAtual.opcoes.forEach(opcaoTexto => {
        const botao = document.createElement("button");
        botao.textContent = opcaoTexto;
        botao.classList.add("opcao");

        botao.onclick = () => {
            const todosBotoes = document.querySelectorAll(".opcao");
            todosBotoes.forEach(b => b.classList.remove("selecionada"));
            botao.classList.add("selecionada");
        };

        opcoesContainer.appendChild(botao);
    });
}

function verificarResposta() {
    const respostaSelecionadaEl = document.querySelector(".opcao.selecionada");
    const opcoesContainer = document.getElementById("opcoes");
    const feedbackMessage = document.getElementById('mensagem-feedback');

    if (!respostaSelecionadaEl) {
        alert("Por favor, selecione uma resposta.");
        return;
    }

    if (opcoesContainer) {
        opcoesContainer.classList.add("opcoes-desabilitadas");
    }

    const respostaDoUsuario = respostaSelecionadaEl.textContent;
    const perguntaAtual = perguntas[indiceAtual];

    if (!feedbackMessage) return;

    if (!respostasDadas[indiceAtual]) {
        const correta = (respostaDoUsuario === perguntaAtual.resposta);

        if (correta) {
            acertos++;
            feedbackMessage.textContent = "Resposta Correta!";
            feedbackMessage.className = 'feedback-correto';
            respostaSelecionadaEl.style.backgroundColor = "#2ecc71";
            tocarSom(somAcertou);
        } else {
            erros++;
            feedbackMessage.innerHTML = `Incorreto. A resposta certa é: <strong>${perguntaAtual.resposta}</strong>`;
            feedbackMessage.className = 'feedback-incorreto';
            respostaSelecionadaEl.style.backgroundColor = "#e74c3c";
            tocarSom(somErrou);

            const opcoes = document.querySelectorAll(".opcao");
            opcoes.forEach(opcao => {
                if (opcao.textContent === perguntaAtual.resposta) {
                    opcao.style.backgroundColor = "#2ecc71";
                }
            });
        }

        historicoRespostas.push({
            indicePergunta: indiceAtual,
            pergunta: perguntaAtual.pergunta,
            respostaUsuario: respostaDoUsuario,
            respostaCorreta: perguntaAtual.resposta,
            correta: correta
        });

        respostasDadas[indiceAtual] = true;
    } else {
        feedbackMessage.textContent = "Você já respondeu esta pergunta.";
        feedbackMessage.className = '';
    }

    const proximoBtn = document.getElementById('botao-proximo');
    if (proximoBtn) {
        proximoBtn.textContent = (indiceAtual === perguntas.length - 1) ? 'Finalizar' : 'Próxima';
        proximoBtn.onclick = proximaPergunta;
    }
}

function perguntaAnterior() {
    if (indiceAtual > 0) {
        indiceAtual--;
        carregarPergunta();
    }
}

function proximaPergunta() {
    indiceAtual++;
    if (indiceAtual < perguntas.length) {
        carregarPergunta();
    } else {
        mostrarResultado();
    }
}

async function salvarResultadoNoFirebase() {
    try {
        const chave = 'quiz_historico';
        const existente = JSON.parse(localStorage.getItem(chave) || '[]');
        existente.push({
            nomeUsuario: nomeUsuario || 'Sem nome',
            acertos: acertos,
            erros: erros,
            totalPerguntas: perguntas.length,
            respostas: historicoRespostas,
            criadoEm: new Date().toISOString()
        });
        localStorage.setItem(chave, JSON.stringify(existente));
        console.log('Resultado do quiz salvo localmente.');
    } catch (e) {
        console.error('Erro ao salvar resultado localmente:', e);
    }
}

function mostrarResultado() {
    const quiz = document.getElementById("quiz");
    const resultado = document.getElementById("resultado");
    const barra = document.getElementById("barra-progresso");
    const mensagem = document.getElementById("mensagem");
    const contadorAcertos = document.getElementById("contador-acertos");
    const contadorErros = document.getElementById("contador-erros");

    if (quiz) quiz.classList.add("oculto");
    if (resultado) resultado.classList.remove("oculto");
    if (barra) barra.style.width = "100%";

    if (mensagem) {
        mensagem.innerHTML = `
            <h2>Resultado Final, <strong>${nomeUsuario}</strong>!</h2>
            <p>Você completou o quiz de tecnologia!</p>
        `;
    }

    if (contadorAcertos) contadorAcertos.textContent = acertos;
    if (contadorErros) contadorErros.textContent = erros;

    tocarSom(somSucesso, 60);

    salvarResultadoNoFirebase();
}

function reiniciarQuiz() {
    if (somAcertou) somAcertou.pause();
    if (somErrou) somErrou.pause();
    if (somSucesso) somSucesso.pause();
    if (somDerrota) somDerrota.pause?.();

    const quizPrincipal = document.getElementById("quiz-principal");
    const containerInicio = document.getElementById("container-inicio");
    const nomeInput = document.getElementById("entrada-nome");
    const errorMessage = document.getElementById("mensagem-erro");
    const barra = document.getElementById("barra-progresso");

    if (quizPrincipal) quizPrincipal.classList.add("oculto");
    if (containerInicio) containerInicio.classList.remove("oculto");
    if (nomeInput) nomeInput.value = "";
    if (errorMessage) errorMessage.classList.add("oculto");
    if (nomeInput) nomeInput.classList.remove("entrada-erro");
    if (barra) barra.style.width = "0%";
}

window.iniciarQuiz = iniciarQuiz;
window.perguntaAnterior = perguntaAnterior;
window.reiniciarQuiz = reiniciarQuiz;

document.addEventListener('DOMContentLoaded', () => {
    const btnComecar = document.getElementById('btn-comecar');
    const nomeInput = document.getElementById('entrada-nome');

    if (btnComecar) btnComecar.addEventListener('click', iniciarQuiz);
    if (nomeInput) nomeInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') iniciarQuiz(); });
});
