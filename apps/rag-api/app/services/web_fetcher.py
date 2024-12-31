from typing import Dict, List, Tuple
from aiohttp import ClientSession, ClientTimeout
from bs4 import BeautifulSoup
from app.core import logger
import asyncio


class WebFetcher:
    """
    Initialize WebFetcher with configurable timeout and user agent.

    This class provides methods to fetch content from URLs using aiohttp.
    It also extracts URLs from search results.

    Args:
        timeout (int): Request timeout in seconds (default: 10)
        user_agent (str): Custom user agent string (default: "")
    """

    def __init__(self, timeout: int = 10, user_agent: str = ""):
        self.timeout = ClientTimeout(total=timeout)
        self.headers = {"User-Agent": user_agent or "Custom Web Fetcher Bot 1.0"}

    async def fetch_url(self, session: ClientSession, url: str) -> Tuple[str, str]:
        """
        Fetch content from a URL using aiohttp.

        Args:
            session: aiohttp ClientSession
            url: URL to fetch

        Returns:
            Tuple[str, str]: (title, text content)
        """
        try:
            async with session.get(
                url, timeout=self.timeout, headers=self.headers
            ) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, "html.parser")

                    for script in soup(["script", "style"]):
                        script.decompose()

                    text = soup.get_text(separator="\n", strip=True)
                    title = soup.title.string if soup.title else ""
                    logger.info("Fetched URL", url=url, title=title)
                    return (title or "", text or "")
                else:
                    logger.warning(
                        "Failed to fetch URL", url=url, status=response.status
                    )
                    return "", ""
        except Exception as e:
            logger.error(
                "Error fetching URL", url=url, error=str(e), error_type=type(e).__name__
            )
            return "", ""

    async def fetch_all(self, urls: List[str]) -> Dict[str, Tuple[str, str]]:
        """
        Fetch content from multiple URLs concurrently.
        Args:
            urls: List of URLs to fetch
        Returns:
            Dict[str, Tuple[str, str]]: Mapping of URL to (title, text content)
        """
        async with ClientSession() as session:
            tasks = [self.fetch_url(session, url) for url in urls]
            results = await asyncio.gather(*tasks)
            logger.info("Fetched content from all URLs", count=len(results))
            return dict(zip(urls, results))

    def extract_urls(self, search_results: List[Dict]) -> List[str]:
        """
        Extract URLs from search results.

        Args:
            search_results: List of search result dictionaries

        Returns:
            List[str]: List of URLs
        """
        return [result["href"] for result in search_results if "href" in result]
