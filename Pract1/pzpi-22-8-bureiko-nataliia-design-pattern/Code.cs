
// Інтерфейс стану
public interface IPhoneState
{
    void HandleCall();
}

// Конкретний стан — гучний режим
public class NormalState : IPhoneState
{
    public void HandleCall()
    {
        Console.WriteLine("Дзвінок лунає голосно.");
    }
}

// Конкретний стан — вібрація
public class VibrationState : IPhoneState
{
    public void HandleCall()
    {
        Console.WriteLine("Телефон вібрує без звуку.");
    }
}

// Конкретний стан — без звуку
public class SilentState : IPhoneState
{
    public void HandleCall()
    {
        Console.WriteLine("Телефон мовчить.");
    }
}

// Контекст — телефон
public class MobilePhone
{
    private IPhoneState _state;

    public void SetState(IPhoneState state)
    {
        _state = state;
    }

    public void IncomingCall()
    {
        _state.HandleCall(); // Делегуємо виклик поточному стану
    }
}

// Інтерфейс стану
public interface ICoffeeState
{
    void PressButton(CoffeeMachine context);
}

// Стан очікування
public class WaitingState : ICoffeeState
{
    public void PressButton(CoffeeMachine context)
    {
        Console.WriteLine("Готуємо каву...");
        context.SetState(new BrewingState());
    }
}

// Стан приготування
public class BrewingState : ICoffeeState
{
    public void PressButton(CoffeeMachine context)
    {
        Console.WriteLine("Кава вже готується. Будь ласка, зачекайте.");
        context.SetState(new ReadyState());
    }
}

// Стан готовності
public class ReadyState : ICoffeeState
{
    public void PressButton(CoffeeMachine context)
    {
        Console.WriteLine("Заберіть каву. Повернення до стану очікування.");
        context.SetState(new WaitingState());
    }
}

// Контекст
public class CoffeeMachine
{
    private ICoffeeState state;

    public CoffeeMachine()
    {
        state = new WaitingState();
    }

    public void SetState(ICoffeeState newState)
    {
        state = newState;
    }

    public void PressButton()
    {
        state.PressButton(this);
    }
}

