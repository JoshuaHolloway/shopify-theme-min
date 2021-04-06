  const query = `{
                    shop {
                      name
                    }
                  }`;

  function apiCall(query) {
    // return fetch('https://thememinimal.myshopify.com/api/graphql.json', { // same as below
    return fetch('/api/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/graphql',
        'X-Shopify-Storefront-Access-Token': x.get('storefront_access_token')
      },
      body: query
    }).then(response => response.json());
  }

  $(document).ready(function() {
    const $app = $('#app');
  });

  apiCall(query).then(response => {

    console.log('Store Front API GraphQL Response: ');
    console.log(response);
  });