import logging
import requests
from datetime import datetime, timedelta
from typing import List, Dict
import feedparser

logger = logging.getLogger(__name__)


class NewsIngestor:
    """
    Ingest news articles and sentiment analysis
    Uses Google News RSS feed + simple sentiment scoring
    """
    
    def __init__(self, db):
        self.db = db
        self.news_collection = db["news"]
        # Google News RSS endpoints
        self.news_feeds = {
            'IN': 'https://news.google.com/rss/search?q=agriculture+india&ceid=IN:en',
            'US': 'https://news.google.com/rss/search?q=agriculture+usa&ceid=US:en',
            'BR': 'https://news.google.com/rss/search?q=agriculture+brazil&ceid=BR:pt',
            'AR': 'https://news.google.com/rss/search?q=agriculture+argentina&ceid=AR:es'
        }
    
    def fetch_news(self, country: str, limit: int = 20) -> List[Dict]:
        """
        Fetch latest agriculture news for country from Google News RSS
        """
        logger.info(f"Fetching news articles for {country}")
        
        feed_url = self.news_feeds.get(country)
        if not feed_url:
            logger.warning(f"No feed configured for country {country}")
            return []
        
        try:
            feed = feedparser.parse(feed_url)
            news_items = []
            
            for entry in feed.entries[:limit]:
                # Simple sentiment analysis based on keywords
                sentiment_score = self._analyze_sentiment(entry.title, entry.get('summary', ''))
                
                news_item = {
                    "country": country,
                    "title": entry.title,
                    "summary": entry.get('summary', ''),
                    "link": entry.link,
                    "source": entry.author if hasattr(entry, 'author') else 'Google News',
                    "date": datetime.utcnow(),
                    "published_date": entry.get('published', datetime.utcnow().isoformat()),
                    "sentiment_score": sentiment_score,
                    "categories": self._extract_categories(entry.title),
                    "timestamp": datetime.utcnow()
                }
                news_items.append(news_item)
            
            # Insert/update in database
            self._bulk_upsert(news_items)
            logger.info(f"Ingested {len(news_items)} news articles for {country}")
            
            return news_items
        
        except Exception as e:
            logger.error(f"Error fetching news for {country}: {str(e)}")
            return []
    
    def _bulk_upsert(self, news_items: List[Dict]):
        """Batch insert/update news in MongoDB"""
        for news in news_items:
            self.news_collection.update_one(
                {
                    "country": news["country"],
                    "title": news["title"]
                },
                {"$set": news},
                upsert=True
            )
    
    def _analyze_sentiment(self, title: str, summary: str) -> float:
        """
        Simple sentiment analysis using keyword matching
        Returns score from -1 (very negative) to 1 (very positive)
        
        In production, use HuggingFace model:
        from transformers import pipeline
        sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased")
        """
        text = (title + " " + summary).lower()
        
        positive_keywords = [
            'good', 'high', 'strong', 'growth', 'increase', 'improve', 'positive',
            'abundant', 'harvest', 'profit', 'flourish', 'thrive', 'expand',
            'recovery', 'boost', 'advantage', 'success', 'stability'
        ]
        
        negative_keywords = [
            'low', 'decline', 'fall', 'weak', 'crisis', 'loss', 'drought',
            'flood', 'damage', 'risk', 'threat', 'poor', 'failure', 'collapse',
            'negative', 'deficit', 'shortage', 'concern', 'struggle'
        ]
        
        positive_count = sum(1 for keyword in positive_keywords if keyword in text)
        negative_count = sum(1 for keyword in negative_keywords if keyword in text)
        
        total = positive_count + negative_count
        if total == 0:
            return 0.0  # Neutral
        
        sentiment = (positive_count - negative_count) / total
        return max(-1, min(1, sentiment))  # Clamp to -1 to 1
    
    def _extract_categories(self, title: str) -> List[str]:
        """Extract news categories from title"""
        categories = []
        keywords = {
            'weather': ['rain', 'drought', 'flood', 'temperature', 'storm', 'climate'],
            'policy': ['government', 'policy', 'regulation', 'law', 'subsidy'],
            'market': ['price', 'market', 'trade', 'export', 'commodity'],
            'disease': ['disease', 'pest', 'blight', 'virus', 'fungal'],
            'technology': ['technology', 'innovation', 'digital', 'ai', 'sensor']
        }
        
        title_lower = title.lower()
        for category, keywords_list in keywords.items():
            if any(kw in title_lower for kw in keywords_list):
                categories.append(category)
        
        return categories or ['general']
    
    def calculate_risk_score(self, news_items: List[Dict]) -> float:
        """
        Calculate aggregate news-based risk score (0-100)
        
        Interpretation:
        - 0-33: Low political/social risk
        - 34-66: Medium risk
        - 67-100: High risk
        """
        if not news_items:
            return 50
        
        sentiments = [item['sentiment_score'] for item in news_items]
        avg_sentiment = np.mean(sentiments)
        
        # Negative sentiment = higher risk
        # sentiment -1 to 1 → risk 100 to 0
        risk_score = ((1 - avg_sentiment) / 2) * 100
        
        return min(100, max(0, risk_score))


import numpy as np


def ingest_news_data(db, country: str) -> float:
    """Entry point for news data ingestion"""
    ingestor = NewsIngestor(db)
    news = ingestor.fetch_news(country)
    news_risk_score = ingestor.calculate_risk_score(news)
    return news_risk_score
