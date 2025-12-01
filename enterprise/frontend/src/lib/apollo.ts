import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  from,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

// Environment configuration
const getGraphQLUrl = (): string => {
  // Check for environment variable first
  const envUrl = import.meta.env.VITE_GRAPHQL_URL

  if (envUrl) {
    return envUrl
  }

  // Fallback based on current hostname
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

  // Production domains
  if (hostname.includes('maternarsantamariense.com.br')) {
    return 'https://api.maternarsantamariense.com.br/graphql'
  }

  // Development/staging domains
  if (hostname.includes('dev-') || hostname.includes('staging')) {
    return 'https://dev-api.maternarsantamariense.com.br/graphql'
  }

  // Vercel preview deployments
  if (hostname.includes('vercel.app')) {
    return 'https://dev-api.maternarsantamariense.com.br/graphql'
  }

  // Local development
  return 'http://localhost:4000/graphql'
}

// Create HTTP link with dynamic URI
const httpLink = createHttpLink({
  uri: getGraphQLUrl(),
  credentials: 'include', // Include cookies for authentication
})

// Authentication link - adds token to headers
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

      // Handle specific error codes
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Clear auth and redirect to login
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')

        // Only redirect if not already on login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)

    // Log additional info in development
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.error('Operation:', operation.operationName)
      console.error('Variables:', operation.variables)
    }
  }
})

// Retry link for network failures (simple implementation)
const retryLink = new ApolloLink((operation, forward) => {
  return forward(operation)
})

// Compose all links
const link = from([
  errorLink,
  retryLink,
  authLink,
  httpLink,
])

// Cache configuration with type policies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Merge paginated results
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
            return [...incoming] // Messages should replace, not merge
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
  },
})

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link,
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
  connectToDevTools: import.meta.env.VITE_DEBUG_MODE === 'true',
})

// Export helper to get current GraphQL URL (useful for debugging)
export const getApiUrl = () => getGraphQLUrl()

// Export helper to clear cache (useful for logout)
export const clearApolloCache = () => {
  apolloClient.clearStore()
}
