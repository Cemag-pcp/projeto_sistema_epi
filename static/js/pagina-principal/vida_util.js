function calcularPrevisaoEntrega(item, dataEntrega, callback) {
    var vidaUtil;

    $.ajax({
        url: '/vida-util',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ 'item': item }),
        success: function (response) {
            vidaUtil = response[0];

            if (dataEntrega === null) {
                // Chama a função de retorno de chamada com uma string vazia
                callback('');
                return;
            }

            var dataEntregaObj = new Date(dataEntrega);

            // Adiciona 365 dias úteis à data de entrega
            var previsaoEntregaObj = adicionarDiasUteis(dataEntregaObj, vidaUtil);

            // Formata a data de previsão de entrega
            var previsaoEntregaFormatada = formatarDataBr(previsaoEntregaObj);

            // Chama a função de retorno de chamada com a previsão de entrega
            callback(previsaoEntregaFormatada);
        },
        error: function () {
            console.log('Item não encontrado');
            // Chama a função de retorno de chamada com um valor padrão ou indicador de erro
            callback(null);
        }
    });
}

// Função para adicionar dias úteis a uma data
function adicionarDiasUteis(data, dias) {
    var dataTemp = new Date(data);
    var diasAdicionados = 0;

    while (diasAdicionados < dias) {
        dataTemp.setDate(dataTemp.getDate() + 1);

        // Verifica se o dia adicionado não é um sábado (6) ou domingo (0)
        if (dataTemp.getDay() !== 0 && dataTemp.getDay() !== 6) {
            diasAdicionados++;
        }
    }

    return dataTemp;
}

