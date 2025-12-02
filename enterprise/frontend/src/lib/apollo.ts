import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  from,
  split,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'

// Environment configuration
const getGraphQLUrl = (): string => {
  const envUrl = import.meta.env.VITE_GRAPHQL_URL

  if (envUrl) {
    return envUrl
  }

  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

  if (hostname.includes('maternarsantamariense.com.br')) {
    return 'https://api.maternarsantamariense.com.br/graphql'
  }

  if (hostname.includes('dev-') || hostname.includes('staging')) {
    return 'https://dev-api.maternarsantamariense.com.br/graphql'
  }

  if (hostname.includes('vercel.app')) {
    return 'https://dev-api.maternarsantamariense.com.br/graphql'
  }

  return 'http://localhost:4000/graphql'
}

const getWsUrl = (): string => {
  const envUrl = import.meta.env.VITE_WS_URL

  if (envUrl) {
    return envUrl.replace('http', 'ws')
  }

  const httpUrl = getGraphQLUrl()
  return httpUrl.replace('http', 'ws')
}

// Create HTTP link
const httpLink = createHttpLink({
  uri: getGraphQLUrl(),
  credentials: 'include',
})

// Create WebSocket link for subscriptions
const wsLink = typeof window !== 'undefined' ? new GraphQLWsLink(createClient({
  url: getWsUrl(),
  connectionParams: () => {
    const token = localStorage.getItem('authToken')
    return {
      authorization: token ? `Bearer ${token}` : '',
    }
  },
  retryAttempts: 5,
  shouldRetry: () => true,
  on: {
    connected: () => console.log('[WS] Connected'),
    closed: () => console.log('[WS] Closed'),
    error: (err) => console.error('[WS] Error:', err),
  },
})) : null

// Authentication link
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken')

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-app-version': import.meta.env.VITE_APP_VERSION || '2.0.0',
      'x-app-env': import.meta.env.VITE_ENV || 'local',
    },
  }
})

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )

      if (extensions?.code === 'UNAUTHENTICATED') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)

    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.error('Operation:', operation.operationName)
      console.error('Variables:', operation.variables)
    }
  }
})

// Compose HTTP links
const httpLinkWithAuth = from([
  errorLink,
  authLink,
  httpLink,
])

// Split link: WebSocket for subscriptions, HTTP for queries/mutations
const splitLink = wsLink ? split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLinkWithAuth,
) : httpLinkWithAuth

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        users: {
          keyArgs: ['filter'],
          merge(existing = [], incoming) {
            return [...existing, ...incoming]
          },
        },
        courses: {
          keyArgs: ['filter', 'category'],
          merge(existing = [], incoming) {
            return [...existing, ...incoming]
          },
        },
        messages: {
          keyArgs: ['channelId'],
          merge(existing = [], incoming) {
            // For messages, we want to append new ones
            const existingIds = new Set(existing.map((m: any) => m.__ref || m.id))
            const newMessages = incoming.filter((m: any) => !existingIds.has(m.__ref || m.id))
            return [...existing, ...newMessages]
          },
        },
        channels: {
          merge(existing = [], incoming) {
            return incoming // Channels should replace
          },
        },
      },
    },
    User: {
      keyFields: ['id'],
    },
    Course: {
      keyFields: ['id'],
    },
    Channel: {
      keyFields: ['id'],
    },
    Message: {
      keyFields: ['id'],
    },
  },
})

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  connectToDevTools: import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.DEV,
})

// Export helpers
export const getApiUrl = () => getGraphQLUrl()

export const clearApolloCache = () => {
  apolloClient.clearStore()
}
