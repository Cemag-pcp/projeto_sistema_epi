document.getElementById('salvarCadastroFuncionario').addEventListener('click', function () {

    //enviar dados de cadastro para backend
    var matriculaFuncionario = document.getElementById('matriculaFuncionario').value;
    var nomeFuncionario = document.getElementById('nomeFuncionario').value;
    
    var selectSetor = document.querySelector('#idSetor');
    var setor = selectSetor.value;

    var dataAdmissao = formatarDataAdmissao(document.getElementById('dataAdmissao').value);

    console.log(matriculaFuncionario,nomeFuncionario,setor,dataAdmissao)

    var button = document.getElementById('salvarCadastroFuncionario');
    
    // //disable button
    button.disabled = true;

    if (matriculaFuncionario === '' || nomeFuncionario === '' || setor === '' || dataAdmissao === '') {
        alert('Preencha todos os campos');
        button.disabled = false;
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/cadastrar-funcionario',
        data: {
            nome: nomeFuncionario,
            matricula: matriculaFuncionario,
            setor:setor,
            data_admissao:dataAdmissao,
        },
        success: function (response) {
            // Lidar com a resposta do backend, se necessário
            exibirMensagem(response.tipo_mensagem, response.mensagem)

            //undisable button
            button.disabled = false;

        },
        error: function (error) {
            console.error('Erro!', error);
        }
    });

    //receber sucesso ou erro do backend
    //informar ao usuario
});


function formatarDataAdmissao(dataAdmissao){
    
    const currentDate = new Date(dataAdmissao);

    currentDate.setDate(currentDate.getDate() + 1);

    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };

    return currentDate.toLocaleDateString('pt-BR', options)
}