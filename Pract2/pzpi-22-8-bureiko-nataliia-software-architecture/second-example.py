# Приклад обробки подій через Kafka (Python)
from kafka import KafkaConsumer

consumer = KafkaConsumer(
    'user-activity',
    bootstrap_servers=['kafka-broker1:9092', 'kafka-broker2:9092'],
    group_id='recommendation-service',
    auto_offset_reset='earliest'
)

for message in consumer:
    user_event = message.value
    print(f"Обробка події користувача: {user_event}") 
    # Логіка оновлення рекомендацій
