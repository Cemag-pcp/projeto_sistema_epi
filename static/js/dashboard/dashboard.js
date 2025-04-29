function atualizarDados() {
    fetch("/atualizar-dashboard")
        .then(response => response.json())
        .then(data => {
            // console.log('atualizarDadosFunc');
            const solicitacoes = data.solicitacoes; // Não precisa usar JSON.parse

            // Limpa as divs existentes
            const dadosContainer = document.querySelector("#dados-container");
            dadosContainer.innerHTML = "";

            if (solicitacoes.length > 0 ) {
                // Atualiza as requisições
                solicitacoes.forEach(item => {
                    dadosContainer.innerHTML += `
                        <div class="col-lg-3">
                            <div class="card text-dark bg-light mb-4 mt-5"
                                style="max-width: 30rem; font-size: 1.2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                
                            <div class="card-header text-white" 
                                style="background-color: rgb(78, 115, 223); border-top-left-radius: 15px; border-top-right-radius: 15px;">
                                <h4 class="fw-bold mb-0">Solicitação - ${ item[0] }</h4>
                            </div>
                        
                            <div class="card-body">
                                <h5 class="card-title">Funcionário: ${ item[7] }</h5>
                                <h5 class="card-title">Solicitante: ${ item[2] }</h5>
                                <p class="card-text">Item: ${ item[3] }</p>
                                <p class="card-text">Data Solicitação: ${ item[8] }</p>
                                <p class="card-text" id="data-solicitacao-iso-${item[0]}" style="display: none;">${ item[item.length - 1] }</p>
                        
                                <span class="card-text fw-bold bg-warning d-inline-block"
                                    style="font-size: 1.5rem; border-radius: 5px; padding: 5px;" id="contador-${item[0]}">
                                00:00:00
                                </span>
                            </div>
                        
                            <div class="card-footer bg-light text-secondary" 
                                style="border-bottom-left-radius: 15px; border-bottom-right-radius: 15px;">
                                <small class="text-muted">Quantidade - ${ item[4] }</small>
                            </div>
                            </div>
                        </div>`
                });


            // Inicializa os contadores
            dataSolicitacoesIsoList.forEach(elemento => {
                var idList = elemento.id.split('-');
                var solicitacaoId = idList[idList.length - 1];

                atualizarContador(solicitacaoId, elemento.textContent);

            });

        } else {
            // Se não houver nenhuma requisição ou transferência, exibe a mensagem
            dadosContainer.innerHTML = `
                <div class="col-lg-6">
                    <div class="card text-dark bg-light mb-4 mt-5" 
                        style="max-width: 30rem; font-size: 1.2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <div class="card-header">
                            <h4 class="fw-bold"><i class="fa-solid fa-check" style="color: green;"></i></h4>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">Sem Solicitações</h5>
                            <p class="card-text">...</p>
                        </div>
                    </div>
                </div>`;
        }

    })
        .catch(error => console.error('Erro ao atualizar os dados:', error));
}

setInterval(atualizarDados,300000);

var dataSolicitacoesIsoList = document.querySelectorAll('[id^="data-solicitacao-iso-"]');


document.addEventListener('DOMContentLoaded', () => {
    // atualizarDados();

    dataSolicitacoesIsoList.forEach(elemento => {
        var idList = elemento.id.split('-');
        var solicitacaoId = idList[idList.length - 1];

        atualizarContador(solicitacaoId, elemento.textContent);

    });

});

// Função para calcular o tempo decorrido
function atualizarContador(idSolicitacao,dataSolicitacao) {
    var dataSolicitacaoDate = new Date(dataSolicitacao);
    // console.log(dataSolicitacaoDate);

    const contador = document.querySelector(`#contador-${idSolicitacao}`);
    

    // Função que calcula e atualiza o tempo
    function atualizarTempo() {
        var agora = new Date(); // Data e hora atuais
        var tempoDecorrido = Math.floor((agora - dataSolicitacaoDate) / 1000); // Tempo em segundos
        // console.log(tempoDecorrido);

        var dias = Math.floor(tempoDecorrido / 86400); // Calcula os dias
        var horas = Math.floor((tempoDecorrido % 86400) / 3600); // Calcula as horas
        var minutos = Math.floor((tempoDecorrido % 3600) / 60); // Calcula os minutos
        var segundos = tempoDecorrido % 60; // Calcula os segundos

        // Atualiza o contador no formato: dias, horas, minutos e segundos
        contador.innerHTML = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
    }
    // Atualiza o contador a cada 1 segundo (1000 milissegundos)
    setInterval(atualizarTempo, 1000);

}