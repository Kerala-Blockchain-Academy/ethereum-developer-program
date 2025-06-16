import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({
  uri: 'http://127.0.0.1:8545/graphql/',
  cache: new InMemoryCache({
    typePolicies: {
      Block: {
        keyFields: ['hash'],
      },
    },
  }),
})

createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)
