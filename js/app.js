$(document).ready(function() {
    
    // --- LÓGICA DO FORMULÁRIO PRINCIPAL ---
    const apiUrl = 'http://localhost:3000';
    let userRating = 0; // Armazena a avaliação selecionada

    // Carrega o nome do usuário do db.json local
    $.get(`${apiUrl}/users/1`, function(user) {
        $('#nome').val(user.name);
    });

    // Carrega a lista de serviços do db.json local para o menu <select>
    $.get(`${apiUrl}/services`, function(services) {
        services.forEach(service => {
            $('#servico').append(`<option value="${service.id}">${service.name}</option>`);
        });
    });

    // Função para carregar os feedbacks já existentes do db.json
    function carregarFeedbacksIniciais() {
        $.get(`${apiUrl}/feedbacks`, function(feedbacks) {
            todosOsFeedbacks = feedbacks.reverse();
            $('#feedbacks-list').empty();
            ultimoIndiceExibido = 0;
            exibirProximosFeedbacks();
        });
    }

    // Função para adicionar um novo feedback na lista da tela
    function adicionarFeedbackNaTela(feedback, metodo) {
        const ratingStars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
        const feedbackHtml = `<li class="feedback-item"><p class="comment">"${feedback.comment}"</p><p class="author">- ${feedback.name} (Serviço: ${feedback.serviceName})</p><p class="rating">${ratingStars}</p></li>`;
        if (metodo === 'prepend') {
            $('#feedbacks-list').prepend(feedbackHtml);
        } else {
            $('#feedbacks-list').append(feedbackHtml);
        }
    }

    // ==========================================================
    //  CÓDIGO CORRIGIDO E COMPLETO PARA AS ESTRELAS
    // ==========================================================
    $('.star').on('mouseenter mouseleave click', function(event) {
        const hoverValue = $(this).data('value');
        
        // Controla o efeito de passar o mouse (hover)
        if (event.type === 'mouseenter') {
            $('.star').each(function() {
                // Adiciona a classe 'hover' nas estrelas até a que o mouse está em cima
                $(this).toggleClass('hover', $(this).data('value') <= hoverValue);
            });
        } else if (event.type === 'mouseleave') {
            // Limpa o efeito hover de todas as estrelas quando o mouse sai
            $('.star').removeClass('hover');
        } else if (event.type === 'click') {
            // Define a avaliação permanente ao clicar
            userRating = hoverValue;
            $('#rating').val(userRating); // Atualiza o valor no campo escondido do formulário
            
            // Garante que o efeito hover seja removido
            $('.star').removeClass('hover');
            
            // Aplica a classe 'selected' para marcar visualmente a seleção
            $('.star').each(function() {
                $(this).toggleClass('selected', $(this).data('value') <= userRating);
            });
        }
    });
    // ==========================================================

    // Lógica de envio do formulário principal de feedback
    $('#feedback-form').submit(function(event) {
        event.preventDefault();
        if ($('#nome').val().trim() === '' || $('#servico').val() === '' || userRating === 0 || $('#comentario').val().trim() === '') {
            $('#form-error').text('Por favor, preencha todos os campos e selecione uma avaliação.').show();
            return;
        }
        $('#form-error').hide();
        const feedbackData = { name: $('#nome').val(), serviceName: $('#servico option:selected').text(), rating: userRating, comment: $('#comentario').val() };
        const submitBtn = $('#submit-btn');
        submitBtn.text('Enviando...').prop('disabled', true);
        $.ajax({
            url: `${apiUrl}/feedbacks`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(feedbackData),
            success: function(novoFeedback) {
                adicionarFeedbackNaTela(novoFeedback, 'prepend');
                todosOsFeedbacks.unshift(novoFeedback);
                $('#feedback-form-wrapper').hide();
                $('#thank-you-message').show();
                setTimeout(function() {
                    $('#thank-you-message').hide();
                    $('#feedback-form-wrapper').show();
                    $('#feedback-form')[0].reset();
                    userRating = 0;
                    $('.star').removeClass('selected');
                    submitBtn.text('Enviar Feedback').prop('disabled', false);
                }, 4000);
            },
            error: function() {
                submitBtn.text('Enviar Feedback').prop('disabled', false);
                $('#form-error').text('Ocorreu um erro ao enviar. Tente novamente.').show();
            }
        });
    });
    
    // --- LÓGICA PARA A SEÇÃO DE "CARREGAR MAIS" ---
    let todosOsFeedbacks = [];
    let ultimoIndiceExibido = 0;
    const feedbacksPorVez = 5;

    function exibirProximosFeedbacks() {
        const lista = $('#feedbacks-list');
        const botao = $('#carregar-mais-btn');
        const proximosFeedbacks = todosOsFeedbacks.slice(ultimoIndiceExibido, ultimoIndiceExibido + feedbacksPorVez);
        proximosFeedbacks.forEach(function(feedback) {
            adicionarFeedbackNaTela(feedback, 'append');
        });
        ultimoIndiceExibido += proximosFeedbacks.length;
        if (ultimoIndiceExibido >= todosOsFeedbacks.length) {
            botao.hide();
        } else {
            botao.show();
        }
    }

    $('#carregar-mais-btn').click(function() {
        exibirProximosFeedbacks();
    });

    // Inicia a aplicação
    carregarFeedbacksIniciais();
});