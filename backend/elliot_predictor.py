import sys
import json
import io
import base64
import warnings
import yfinance as yf
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# --- Suppress warnings ---
warnings.filterwarnings('ignore')

def fetch_stock_data(ticker):
    stock = yf.Ticker(ticker)
    data = stock.history(period="1y")
    return data

def calculate_rsi(data, period=14):
    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    data['RSI'] = rsi
    return data

def find_lowest_rsi(data):
    min_rsi_date = data['RSI'].idxmin()
    return min_rsi_date

def calculate_elliott_waves(data, start_date):
    start_index = data.index.get_loc(start_date)
    prices = data['Close'][start_index:]

    wave1_start = prices.iloc[0]
    wave1_end = prices.iloc[round(len(prices) * 0.2)]
    wave2_end = wave1_start + (wave1_end - wave1_start) * 0.50
    wave3_end = wave1_end + (wave1_end - wave1_start) * 1.61
    wave4_end = wave3_end - (wave3_end - wave1_end) * 0.38
    wave5_end = wave3_end + (wave3_end - wave1_end) * 1.38

    waves = {
        "Wave 1": (wave1_start, wave1_end),
        "Wave 2": (wave1_end, wave2_end),
        "Wave 3": (wave2_end, wave3_end),
        "Wave 4": (wave3_end, wave4_end),
        "Wave 5": (wave4_end, wave5_end)
    }
    return waves

def generate_base64_chart(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png')
    buf.seek(0)
    base64_image = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return base64_image

def plot_price_chart(data, waves, start_date):
    fig, ax = plt.subplots(figsize=(12, 6))
    start_index = data.index.get_loc(start_date)
    selected_data = data[start_index:]

    ax.plot(selected_data.index, selected_data['Close'], label='Stock Price', color='blue', linewidth=1.5)

    wave_indices = list(selected_data.index)
    wave_labels = ["1", "2", "3", "4", "5"]
    wave_points = list(waves.values())

    for i in range(len(wave_points)):
        if i < len(wave_points) - 1:
            ax.plot(
                [wave_indices[round(len(wave_indices) * i / 5)], wave_indices[round(len(wave_indices) * (i + 1) / 5)]],
                [wave_points[i][0], wave_points[i][1]],
                marker='o',
                label=f'Wave {wave_labels[i]}',
                linewidth=2,
            )

    wave5_start, wave5_end = waves["Wave 5"]
    future_date = selected_data.index[-1] + pd.Timedelta(days=80)
    ax.plot(
        [selected_data.index[-1], future_date],
        [wave5_start, wave5_end],
        marker='o',
        linestyle='--',
        color='red',
        label='Predicted Wave 5',
    )

    ax.set_title('Elliott Waves with Predicted Wave 5', fontsize=14)
    ax.set_xlabel('Date', fontsize=12)
    ax.set_ylabel('Price', fontsize=12)
    ax.legend()
    ax.grid()
    plt.xticks(rotation=45)

    return generate_base64_chart(fig)

def plot_rsi_chart(data, ticker, start_date):
    fig, ax = plt.subplots(figsize=(12, 6))
    start_index = data.index.get_loc(start_date)
    selected_data = data.iloc[start_index:]

    ax.plot(selected_data.index, selected_data['RSI'], label=f'{ticker} RSI', color='orange')
    ax.axhline(30, color='red', linestyle='--', label='Oversold (30)')
    ax.axhline(70, color='green', linestyle='--', label='Overbought (70)')

    ax.set_title(f'{ticker} RSI (From Lowest RSI Date)', fontsize=14)
    ax.set_xlabel('Date', fontsize=12)
    ax.set_ylabel('RSI Value', fontsize=12)
    ax.legend()
    ax.grid()
    plt.xticks(rotation=45)

    return generate_base64_chart(fig)

def load_model():
    class Model:
        def predict(self, ticker):
            try:
                data = fetch_stock_data(ticker)
                if data.empty:
                    raise ValueError(f"No data found for ticker {ticker}")

                data = calculate_rsi(data)
                lowest_rsi_date = find_lowest_rsi(data)
                waves = calculate_elliott_waves(data, lowest_rsi_date)

                price_chart_base64 = plot_price_chart(data, waves, lowest_rsi_date)
                rsi_chart_base64 = plot_rsi_chart(data, ticker, lowest_rsi_date)

                wave5_start, wave5_end = waves["Wave 5"]

                result = {
                    "price_chart": f"data:image/png;base64,{price_chart_base64}",
                    "rsi_chart": f"data:image/png;base64,{rsi_chart_base64}",
                    "prediction": f"{wave5_start:.2f} to {wave5_end:.2f}"
                }
                return result

            except Exception as e:
                return {"error": str(e)}

    return Model()