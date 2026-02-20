import { db } from '../db'
import { QueryResult } from 'pg'

// Generic type for the query parameters
type QueryParams = any[] | undefined

// Generic type for the expected result data
export type QueryResultType<T> = QueryResult<T>

/**
 * Reusable function for database interactions.
 *
 * @param {string} text - SQL query text.
 * @param {QueryParams} params - Query parameters (optional).
 * @returns {Promise<QueryResultType<T>>} - A promise that resolves to the query result.
 */
export async function dbQuery<T>(text: string, params?: QueryParams): Promise<QueryResultType<T>> {
  try {
    const result: QueryResultType<T> = await db.query<T>(text, params)
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error // Re-throw the error to be handled by the caller
  }
}
