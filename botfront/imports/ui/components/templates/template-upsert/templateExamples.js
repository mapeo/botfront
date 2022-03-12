export const examples = [
    { text: 'mensagem de texto simples' },
    {
        text: 'texto acima dos botões',
        buttons: [{ title: 'Botão título 1', payload: '/payload1' }, { title: 'Botão título 2', payload: '/payload2' }],
    },
    {
        text: 'texto opcional acima da imagem (substituir por "" para deixar em branco)',
        image: 'http://url.to.image',
    },
    {
        template_type: 'button',
        text: 'seu texto',
        buttons: [{ title: 'Botão título 1', type: 'postback', payload: '/payload1' }, { title: 'Botão título 2', type: 'web_url', url: 'http://...' }],
    },
    {
        template_type: 'generic',
        elements: [
            {
                title: 'Título de bloco carousel 1',
                buttons: [{ title: 'Botão título 1', type: 'postback', payload: '/payload1' }, { title: 'Botão título 2', type: 'web_url', url: 'http://...' }],
            },
            {
                title: 'Título de bloco carousel 2',
                buttons: [{ title: 'Botão título 1', type: 'postback', payload: '/payload1' }, { title: 'Botão título 2', type: 'web_url', url: 'http://...' }],
            },
        ],
    },
    {
        template_type: 'list',
        top_element_style: 'compact',
        elements: [
            {
                title: 'Tútlo de bloco de lista 1',
                buttons: [{ title: 'Botão título 1', type: 'postback', payload: '/payload1' }, { title: 'Botão título 2', type: 'web_url', url: 'http://...' }],
            },
            {
                title: 'Tútlo de bloco de lista 2',
                buttons: [{ title: 'Botão título 1', type: 'postback', payload: '/payload1' }, { title: 'Botão título 2', type: 'web_url', url: 'http://...' }],
            },
        ],
    },

    {
        template_type: 'handoff',
        expire_after: 120,
    },
    // {
    //     elements: [
    //         {
    //             title: 'Title of carousel block 1',
    //             buttons: [
    //                 { title: 'Button title 1', payload: '/payload1' },
    //                 { title: 'Button title 2', payload: '/payload2' },
    //             ],
    //         },
    //         {
    //             title: 'Title of carousel block 2',
    //             buttons: [
    //                 { title: 'Button title 1', payload: '/payload1' },
    //                 { title: 'Button title 2', payload: '/payload2' },
    //             ],
    //         },
    //     ],
    // },
];
