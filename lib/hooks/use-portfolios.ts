import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function usePortfolios(userId: string) {
  const { data, error, mutate } = useSWR(userId ? `/api/portfolios?userId=${userId}` : null, fetcher)

  return {
    portfolios: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

export function useAssets(portfolioId: number) {
  const { data, error, mutate } = useSWR(portfolioId ? `/api/portfolios/${portfolioId}/assets` : null, fetcher)

  return {
    assets: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
