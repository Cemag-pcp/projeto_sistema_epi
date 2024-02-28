var dataFilter = document.getElementById('data-filter');
var funcionarioFilter = document.getElementById('funcionario-filter');
var solicitanteFilter = document.getElementById('solicitante-filter');
var equipamentoFilter = document.getElementById('equipamento-filter');
var assinaturaFilter = document.getElementById('assinatura-filter');
var motivoFilter = document.getElementById('motivo-filter');

function applyFilters() {

    $('#dataTable').DataTable().destroy();

    // Obtém os valores dos filtros
    let dataFilterValue = dataFilter.value.toLowerCase();
    let funcionarioFilterValue = funcionarioFilter.value.toLowerCase();
    let solicitanteFilterValue = solicitanteFilter.value.toLowerCase();
    let equipamentoFilterValue = equipamentoFilter.value.toLowerCase();
    let assinaturaFilterValue = assinaturaFilter.value.toLowerCase();
    let motivoFilterValue = motivoFilter.value.toLowerCase();
    // let maquinaParadaFilterValue = maquinaParadaFilter.value.toLowerCase();

    // Obtém a tabela
    var table = $('#dataTable').DataTable({
        order: [[7, 'desc']],
        responsive: true,
        columnDefs: [
            // { responsivePriority: 10001, targets: 10 },
            { responsivePriority: 1, targets: 6 },
        ]
    });

    // Aplica a filtragem para cada coluna
    table.columns(0).search(dataFilterValue).draw();
    table.columns(1).search(funcionarioFilterValue).draw();
    table.columns(2).search(solicitanteFilterValue).draw();
    table.columns(4).search(equipamentoFilterValue).draw();
    table.columns(5).search(assinaturaFilterValue).draw();
    table.columns(6).search(motivoFilterValue).draw();
    // table.columns(8).search(maquinaParadaFilterValue).draw();

    // Atualiza a exibição da linha conforme necessário
    table.rows().every(function () {
        let shouldDisplay =
            this.data()[0].toLowerCase().includes(dataFilterValue) &&
            this.data()[1].toLowerCase().includes(funcionarioFilterValue) &&
            this.data()[2].toLowerCase().includes(solicitanteFilterValue) &&
            this.data()[4].toLowerCase().includes(equipamentoFilterValue) &&
            this.data()[5].toLowerCase().includes(assinaturaFilterValue) &&
            this.data()[6].toLowerCase().includes(motivoFilterValue)
            // this.data()[8].toLowerCase().includes(maquinaParadaFilterValue);

        this.node().style.display = shouldDisplay ? '' : 'none';
    });

    let visibleRows = table.rows({ search: 'applied' }).data().toArray();

    // Retorna os dados filtrados
    return visibleRows;
}

dataFilter.addEventListener('input', applyFilters);
funcionarioFilter.addEventListener('input', applyFilters);
solicitanteFilter.addEventListener('input', applyFilters);
equipamentoFilter.addEventListener('input', applyFilters);
assinaturaFilter.addEventListener('change', applyFilters);
motivoFilter.addEventListener('change', applyFilters);

applyFilters();
