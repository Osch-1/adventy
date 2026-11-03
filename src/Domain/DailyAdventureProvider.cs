namespace Domain;

public class DailyAdventureProvider
{
    private readonly IReadOnlyDictionary<(int Month, int Day), Adventure> _adventures;

    public DailyAdventureProvider()
    {
        var adventures = new Dictionary<(int Month, int Day), Adventure>
        {
            {
                (12, 1),
                new Adventure(
                    new DateTimeOffset(2026, 12, 1, 0, 0, 0, TimeSpan.Zero),
                    "🎯 Задание на сегодня",
                    "Стартуем: На столах у каждого есть тайм-код, в чат отправляй скрин какой момент попался тебе"
                )
            },
            {
                (12, 2),
                new Adventure(
                    new DateTimeOffset(2026, 12, 2, 0, 0, 0, TimeSpan.Zero),
                    "✨ Твое приключение",
                    "Сегодня сделай коллаж из фото. Смотри в окно утром, в обед, вечером. Отправь фото в чат, что ты там увидел в разное время суток:)"
                )
            },
            {
                (12, 3),
                new Adventure(
                    new DateTimeOffset(2026, 12, 3, 0, 0, 0, TimeSpan.Zero),
                    "🎄 Новогоднее задание",
                    "Ищем на улице желтый объект, фото кидаем в чат"
                )
            },
            {
                (12, 4),
                new Adventure(
                    new DateTimeOffset(2026, 12, 4, 0, 0, 0, TimeSpan.Zero),
                    "🌟 Сегодняшний квест",
                    "В этом году снова не можем пройти мимо милых, обаятельных и хвостатых) Кидай фото питомца в чат:) Если есть какая-то смешная история - делись)"
                )
            },
            {
                (12, 5),
                new Adventure(
                    new DateTimeOffset(2026, 12, 5, 0, 0, 0, TimeSpan.Zero),
                    "🎁 Задание дня",
                    "Сегодня нужно купить зелёный горошек. Да, вот так. Заранее!"
                )
            },
            {
                (12, 6),
                new Adventure(
                    new DateTimeOffset(2026, 12, 6, 0, 0, 0, TimeSpan.Zero),
                    "❄️ Зимнее приключение",
                    "Делаем новогоднее оригами. Инструкция [тут](https://www.youtube.com/watch?v=3v8qVDh1qf4)"
                )
            },
            {
                (12, 7),
                new Adventure(
                    new DateTimeOffset(2026, 12, 7, 0, 0, 0, TimeSpan.Zero),
                    "🎊 Твоя миссия",
                    "Скинь скрин последнего промпта ИИшке"
                )
            },
            {
                (12, 8),
                new Adventure(
                    new DateTimeOffset(2026, 12, 8, 0, 0, 0, TimeSpan.Zero),
                    "🎈 Задание для тебя",
                    "На 2 этаже офиса спрятаны 8 новогодних котов, найди всех. С последним найденным - сделай фото)"
                )
            },
            {
                (12, 9),
                new Adventure(
                    new DateTimeOffset(2026, 12, 9, 0, 0, 0, TimeSpan.Zero),
                    "🎯 Задание на сегодня",
                    "Зарядка 5 минут. Фотоотчет кидаем в чат"
                )
            },
            {
                (12, 10),
                new Adventure(
                    new DateTimeOffset(2026, 12, 10, 0, 0, 0, TimeSpan.Zero),
                    "🎯 Задание на сегодня",
                    "Попроси любую нейросеть написать трехстишие о твоем любимом языке программирования. Скинь лучший результат."
                )
            },
            {
                (12, 11),
                new Adventure(
                    new DateTimeOffset(2026, 12, 11, 0, 0, 0, TimeSpan.Zero),
                    "✨ Твое приключение",
                    "Обзор \"Что в моей сумке/кармане\"."
                )
            },
            {
                (12, 12),
                new Adventure(
                    new DateTimeOffset(2026, 12, 12, 0, 0, 0, TimeSpan.Zero),
                    "🎄 Новогоднее задание",
                    "Готовим один любой новогодний десерт. Есть тоже не забываем"
                )
            },
            {
                (12, 13),
                new Adventure(
                    new DateTimeOffset(2026, 12, 13, 0, 0, 0, TimeSpan.Zero),
                    "🌟 Сегодняшний квест",
                    "Адвент-календарь сегодня отдыхает, и ты отдыхай."
                )
            },
            {
                (12, 14),
                new Adventure(
                    new DateTimeOffset(2026, 12, 14, 0, 0, 0, TimeSpan.Zero),
                    "🎁 Задание дня",
                    "Ёлка бывает разная: Наряди любой предмет, как ёлку:)"
                )
            },
            {
                (12, 15),
                new Adventure(
                    new DateTimeOffset(2026, 12, 15, 0, 0, 0, TimeSpan.Zero),
                    "❄️ Зимнее приключение",
                    "Сделай скрин любимого фона на онлайн встречах"
                )
            },
            {
                (12, 16),
                new Adventure(
                    new DateTimeOffset(2026, 12, 16, 0, 0, 0, TimeSpan.Zero),
                    "🎊 Твоя миссия",
                    "Звуки офиса/дома. Запиши 10-секундное аудио того, что происходит вокруг тебя прямо сейчас (звук кофе-машины, кот мурлычет, смех, тишина и т.д.) и скинь в чат."
                )
            },
            {
                (12, 17),
                new Adventure(
                    new DateTimeOffset(2026, 12, 17, 0, 0, 0, TimeSpan.Zero),
                    "🎈 Задание для тебя",
                    "Напиши один совет себе-джуну, который только начинал работать в IT."
                )
            },
            {
                (12, 18),
                new Adventure(
                    new DateTimeOffset(2026, 12, 18, 0, 0, 0, TimeSpan.Zero),
                    "🎯 Задание на сегодня",
                    "Ищем собаку на улице. Фоткаем её. Вот такие дела, собачка."
                )
            },
            {
                (12, 19),
                new Adventure(
                    new DateTimeOffset(2026, 12, 19, 0, 0, 0, TimeSpan.Zero),
                    "✨ Твое приключение",
                    "Если есть трекер шагов. Кидай в чат сколько прошёл за сегодня)"
                )
            },
            {
                (12, 20),
                new Adventure(
                    new DateTimeOffset(2026, 12, 20, 0, 0, 0, TimeSpan.Zero),
                    "🎄 Новогоднее задание",
                    "Одно любое доброе дело снова сделаем, фото не нужно"
                )
            },
            {
                (12, 21),
                new Adventure(
                    new DateTimeOffset(2026, 12, 21, 0, 0, 0, TimeSpan.Zero),
                    "🌟 Сегодняшний квест",
                    "Снежинка из кода. Напиши мини-скрипт на любом подходящем языке, который рисует снежинку. Скрин с результатом кидай в чат."
                )
            },
            {
                (12, 22),
                new Adventure(
                    new DateTimeOffset(2026, 12, 22, 0, 0, 0, TimeSpan.Zero),
                    "🎁 Задание дня",
                    "Задание со стоп-кадром из любого новогоднего фильма тоже актуально в этом году. Шедевры этого года кидаем в чат."
                )
            },
            {
                (12, 23),
                new Adventure(
                    new DateTimeOffset(2026, 12, 23, 0, 0, 0, TimeSpan.Zero),
                    "❄️ Зимнее приключение",
                    "Сегодня отправляем кружочек с благодарностью одному человеку в команде."
                )
            },
            {
                (12, 24),
                new Adventure(
                    new DateTimeOffset(2026, 12, 24, 0, 0, 0, TimeSpan.Zero),
                    "🎊 Твоя миссия",
                    "Мандарины до сих пор не ели чтоли? Угости коллегу."
                )
            },
            {
                (12, 25),
                new Adventure(
                    new DateTimeOffset(2026, 12, 25, 0, 0, 0, TimeSpan.Zero),
                    "🪩 Задание на сегодня",
                    "Отправляй своё слово года"
                )
            },
            {
                (12, 26),
                new Adventure(
                    new DateTimeOffset(2026, 12, 26, 0, 0, 0, TimeSpan.Zero),
                    "💙 Сегодняшний квест",
                    "Зеленый горошек помните покупали? Сегодня краш тест новогоднего салата с ним. Готовим."
                )
            },
            {
                (12, 27),
                new Adventure(
                    new DateTimeOffset(2026, 12, 27, 0, 0, 0, TimeSpan.Zero),
                    "🎄 Новогоднее задание",
                    "Сегодня делаем снеговика. А ещё прикрепляем фото снеговика в 25 году"
                )
            },
            {
                (12, 28),
                new Adventure(
                    new DateTimeOffset(2026, 12, 28, 0, 0, 0, TimeSpan.Zero),
                    "🌟 Сегодняшний квест",
                    "День прикольных носков. Фото по традиции кидаем в чат)"
                )
            },
            {
                (12, 29),
                new Adventure(
                    new DateTimeOffset(2026, 12, 29, 0, 0, 0, TimeSpan.Zero),
                    "🎁 Задание дня",
                    "Напиши чем ты гордишься в этом году"
                )
            },
            {
                (12, 30),
                new Adventure(
                    new DateTimeOffset(2026, 12, 30, 0, 0, 0, TimeSpan.Zero),
                    "❄️ Зимнее приключение",
                    "Задание со звездочкой: Сегодня рейд Деда Мороза. Поймай его и сделай фото."
                )
            },
            {
                (12, 31),
                new Adventure(
                    new DateTimeOffset(2026, 12, 31, 0, 0, 0, TimeSpan.Zero),
                    "🎊 Твоя миссия",
                    "Просто сегодня загадываем желание на грядущий год"
                )
            }
        };

        _adventures = adventures;
    }

    /// <summary>
    /// Gets the adventure for a specific date.
    /// </summary>
    /// <param name="searchDate">The date to look up. The year and time component will be ignored.</param>
    /// <returns>The adventure for the given date, or null if none is found.</returns>
    public Adventure? GetAdventureForDate( DateTimeOffset searchDate )
    {
        (int Month, int Day) key = (searchDate.Month, searchDate.Day);

        if ( _adventures.TryGetValue( key, out Adventure? adventure ) )
        {
            return adventure;
        }

        return null;
    }
}

