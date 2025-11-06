import logging
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import json

logger = logging.getLogger(__name__)


class PricePredictor:
    """
    LSTM-style price prediction model for commodity forecasting
    Uses historical price data to predict 30-day forward prices
    """
    
    def __init__(self, db, look_back: int = 30):
        """
        Initialize price predictor
        
        Args:
            db: MongoDB connection
            look_back: Number of historical days to use for prediction
        """
        self.db = db
        self.commodities_collection = db["commodities"]
        self.look_back = look_back
        self.scaler = MinMaxScaler(feature_range=(0, 1))
    
    def prepare_training_data(self, prices: List[float]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare sequences for LSTM training
        
        Creates sliding windows where input is [t-look_back...t] 
        and output is [t+1]
        """
        if len(prices) < self.look_back + 1:
            return None, None
        
        # Normalize prices
        scaled = self.scaler.fit_transform(np.array(prices).reshape(-1, 1))
        
        X, y = [], []
        for i in range(len(scaled) - self.look_back):
            X.append(scaled[i:i + self.look_back])
            y.append(scaled[i + self.look_back])
        
        return np.array(X), np.array(y)
    
    def simple_lstm_predict(self, prices: List[float], days_ahead: int = 30) -> Dict:
        """
        Simple LSTM-like prediction using exponential smoothing
        
        In production, would use:
        - TensorFlow/Keras LSTM model
        - PyTorch temporal convolutional networks
        - Facebook Prophet for seasonal decomposition
        """
        logger.info(f"Predicting {days_ahead} days ahead with {len(prices)} historical points")
        
        if len(prices) < self.look_back:
            logger.warning(f"Insufficient data: {len(prices)} < {self.look_back}")
            return self._fallback_prediction(prices, days_ahead)
        
        # Use exponential smoothing + trend
        alpha = 0.3  # Smoothing factor
        beta = 0.1   # Trend factor
        
        # Calculate base level and trend
        level = prices[-1]
        trend = (prices[-1] - prices[-self.look_back]) / self.look_back
        
        forecasts = []
        forecast_dates = []
        
        for day in range(1, days_ahead + 1):
            # Exponential smoothing formula
            forecast = level + day * trend
            forecasts.append(float(max(0, forecast)))
            
            forecast_date = datetime.utcnow() + timedelta(days=day)
            forecast_dates.append(forecast_date.isoformat())
        
        # Calculate confidence interval
        residuals = np.diff(prices[-self.look_back:])
        std_error = np.std(residuals)
        
        return {
            "commodity": "unknown",
            "forecast_days": days_ahead,
            "current_price": float(prices[-1]),
            "forecast_values": forecasts,
            "forecast_dates": forecast_dates,
            "trend": "up" if trend > 0 else ("down" if trend < 0 else "stable"),
            "trend_magnitude": float(abs(trend)),
            "confidence_interval": {
                "lower": [max(0, f - 2*std_error) for f in forecasts],
                "upper": [f + 2*std_error for f in forecasts]
            },
            "model": "exponential_smoothing",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _fallback_prediction(self, prices: List[float], days_ahead: int) -> Dict:
        """Fallback simple prediction if insufficient data"""
        if not prices:
            prices = [300]  # Default commodity price
        
        # Just use last price with small random walk
        forecasts = []
        current = prices[-1]
        
        for i in range(days_ahead):
            noise = np.random.normal(0, current * 0.01)  # 1% volatility
            current = current + noise
            current = max(0, current)
            forecasts.append(float(current))
        
        forecast_dates = [
            (datetime.utcnow() + timedelta(days=i+1)).isoformat()
            for i in range(days_ahead)
        ]
        
        return {
            "forecast_values": forecasts,
            "forecast_dates": forecast_dates,
            "model": "random_walk_fallback",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def prophet_style_forecast(self, prices_with_dates: List[Dict], 
                              days_ahead: int = 30) -> Dict:
        """
        Prophet-style seasonal decomposition
        Separates trend, seasonality, and residuals
        
        prices_with_dates: [{'date': datetime, 'price': float}, ...]
        """
        if len(prices_with_dates) < 365:
            logger.info("Insufficient data for seasonal decomposition")
            prices = [p['price'] for p in prices_with_dates]
            return self.simple_lstm_predict(prices, days_ahead)
        
        prices = np.array([p['price'] for p in prices_with_dates])
        
        # Trend component (60-day moving average)
        trend = self._moving_average(prices, window=60)
        
        # Detrended prices
        detrended = prices[59:] - trend
        
        # Seasonal component (365-day pattern)
        seasonal = self._extract_seasonality(detrended, period=365)
        
        # Residuals (random noise)
        residuals = detrended - seasonal
        std_residuals = np.std(residuals)
        
        # Generate forecast
        forecasts = []
        last_trend_value = trend[-1]
        trend_change = (trend[-1] - trend[-60]) / 60  # Average daily change
        
        for day in range(1, days_ahead + 1):
            # Project trend
            proj_trend = last_trend_value + trend_change * day
            
            # Get seasonal component (assume annual cycle)
            seasonal_idx = (len(seasonal) + day) % 365
            proj_seasonal = seasonal[seasonal_idx] if seasonal_idx < len(seasonal) else 0
            
            # Random component
            noise = np.random.normal(0, std_residuals)
            
            # Combine
            forecast_price = proj_trend + proj_seasonal + noise
            forecasts.append(float(max(0, forecast_price)))
        
        return {
            "forecasts": forecasts,
            "trend_component": float(trend[-1]),
            "seasonal_strength": float(np.std(seasonal) / np.std(prices)),
            "residual_std": float(std_residuals),
            "model": "prophet_style",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _moving_average(self, data: np.ndarray, window: int) -> np.ndarray:
        """Calculate moving average"""
        return np.convolve(data, np.ones(window)/window, mode='valid')
    
    def _extract_seasonality(self, data: np.ndarray, period: int) -> np.ndarray:
        """Extract periodic component"""
        if len(data) < period:
            return np.zeros(period)
        
        seasonal = np.zeros(period)
        for i in range(period):
            indices = np.arange(i, len(data), period)
            if len(indices) > 0:
                seasonal[i] = np.mean(data[indices])
        
        return seasonal


class SimpleLSTM:
    """
    Simplified LSTM-like model using NumPy (for environments without TensorFlow)
    Uses recurrent structure to capture temporal dependencies
    """
    
    def __init__(self, input_size: int = 1, hidden_size: int = 32, output_size: int = 1):
        """Initialize model parameters"""
        self.hidden_size = hidden_size
        
        # Initialize weights
        self.Wxh = np.random.randn(hidden_size, input_size) * 0.01
        self.Whh = np.random.randn(hidden_size, hidden_size) * 0.01
        self.Why = np.random.randn(output_size, hidden_size) * 0.01
        
        self.bh = np.zeros((hidden_size, 1))
        self.by = np.zeros((output_size, 1))
    
    def forward(self, X: np.ndarray) -> Tuple[np.ndarray, List[np.ndarray]]:
        """Forward pass through sequence"""
        h = np.zeros((self.hidden_size, 1))
        hs = []
        
        for t in range(X.shape[0]):
            h = np.tanh(np.dot(self.Wxh, X[t:t+1].T) + np.dot(self.Whh, h) + self.bh)
            hs.append(h)
        
        y = np.dot(self.Why, h) + self.by
        return y, hs
    
    def predict(self, X: np.ndarray, steps_ahead: int = 30) -> List[float]:
        """Predict future values"""
        predictions = []
        current = X[-1]
        
        for _ in range(steps_ahead):
            y, _ = self.forward(np.array([[current]]))
            current = y[0, 0]
            predictions.append(float(current))
        
        return predictions
