using Lotographia.Data;
using System;
using System.Linq;

namespace Lotographia.Utils
{
    public static class TokenUtils
    {
        private static readonly Random random = new Random();
        private static readonly (string, string)[] Modifiers = new (string, string)[]
        {
            (null, "acrobatic"), ("almost", null), (null, "antique"), ("appropriately", "appropriate"), (null, "aquatic"), ("artistically", "artistic"),
            ("bitterly", "bitter"), (null, "bland"), (null, "blue"), (null, "blurred"), ("boringly", "boring"), (null, "bulky"),
            (null, "calm"), ("casually", "casual"), ("cautiously", "cautious"), ("cheerfully", "cheerful"), ("creatively", "creative"), ("curiously", "curious"), ("cutely", "cute"),
            ("darkly", "dark"), ("definitely", "definite"), (null, "deliberate"), (null, "delicious"), (null, "dirty"), ("divinely", "divine"), (null, "dusty"),
            (null, "elderly"), ("endlessly", "endless"), (null, "energetic"), (null, "enigmatic"), (null, "enormous"), ("essentially", "essential"),
            (null, "early"), ("eternally", "eternal"), ("ever-so", null), ("extremely", "extreme"),
            (null, "fast"), ("fearfully", "fearful"), ("festively", "festive"), ("fiercely", "fierce"), ("figuratively", "figurative"), (null, "flexible"), (null, "flirty"), (null, "floating"), (null, "flying"),
            (null, "garbage"), ("generally", "general"), (null, "good-looking"), ("greatly", "great"), (null, "green"),
            (null, "hairy"), ("happily", "happy"), ("heavily", "heavy"), ("historically", "historic"), (null, "honest"), ("hungrily", "hungry"),
            (null, "illogical"), ("interestingly", "interesting"),
            (null, "kind"), ("kind-of", null),
            ("largely", "large"), ("literally", "literal"), (null, "little"), ("logically", "logical"), (null, "lonely"), (null, "loud"), (null, "lovely"),
            ("magically", "magical"), (null, "married"), (null, "miniature"), ("moderately", "moderate"), (null, "modern"), (null, "moist"), ("morosely", "morose"),("mostly", null),
            ("naturally", "natural"), (null, "nervous"), ("not", null), ("not-very", null), (null, "notorious"),
            ("obviously", "obvious"), ("oddly", "odd"),
            (null, "pink"), (null, "playful"), (null, "popular"), ("possibly", "possible"), ("practically", "practical"), ("pretty", "pretty"), ("previously", null), ("proudly", "proud"),
            ("quietly", "quiet"), ("quite", null),
            ("radically", "radical"), ("randomly", "random"), ("reasonably", "reasonable"), ("richly", "rich"), (null, "red"), ("ruthlessly", "ruthless"),
            ("sadly", "sad"), (null, "salty"), (null, "silly"), ("slightly", null), (null, "slow"), (null, "small"), (null, "smelly"), ("somewhat", null), ("sort-of", null), ("specifically", "specific"), ("strictly", "strict"), ("suggestively", "suggestive"), ("suspiciously", "suspicious"), ("sweetly", "sweet"),
            ("tediously", "tedious"), ("tenderly", "tender"), ("thirstily", "thirsty"), (null, "tiny"), ("tiringly", "tired"), ("tragically", "tragic"),
            ("uniquely", "unique"), ("unusually", "unusual"), ("urgently", "urgent"),
            ("vaguely", "vague"), ("very", null), ("virtuously", "virtuous"),
            ("weirdly", "weird"), ("wickedly", "wicked"),
            (null, "yellow"), (null, "young"),
            (null, "zany")
        };

        private static readonly string[] Nouns = new string[]
        {
            "abacus", "alien", "anchor", "apple", "asteroid", "astronaut", "avocado",
            "badger", "banana", "barbecue", "beach", "bicycle", "bird", "book", "boot", "bottle", "box", "brick", "bridge", "burger", "butterfly",
            "cabbage", "cable", "cactus", "cake", "calculator", "camera", "carrot", "castle", "cat", "ceiling", "chair", "cheese", "cinema", "cloud", "coaster", "comet", "computer", "container", "crayon", "crow", "crown", "cucumber", "curtain", "cushion",
            "date", "dentist", "desk", "diamond", "dictionary", "dinosaur", "doctor", "dog", "dolphin", "donkey", "dove", "dragon", "duck",
            "encounter", "entity", "evening", "explorer",
            "factory", "fence", "firework", "flower", "fork", "fountain", "friday", "frog", "fruit",
            "garage", "garden", "globe", "goldfish", "goose",
            "hammer", "harvest", "hat", "horse", "house",
            "kennel", "kettle", "kitten",
            "lantern", "laptop", "lettuce", "lightbulb", "library", "lizard", "luck",
            "magazine", "melon", "microwave", "milkshake", "monday", "monster", "month", "monument", "moth", "moose", "morning", "mountain", "mushroom",
            "nettle", "notice", "novice", "number", "nurse",
            "ocean", "orange", "orangutan", "orb", "outlaw", "oval",
            "padlock", "panda", "paradise", "parcel", "parrot", "parsnip", "peach", "photograph", "pig", "pigeon", "pillow", "pirate", "pizza", "planet", "plate", "potato", "pumpkin", "puppy", "puzzle",
            "question",
            "rabbit", "raccoon", "radish", "rainbow", "raven", "realm", "rhubarb", "riddle", "robot", "rooster", "rubbish",
            "saturday", "sausage", "school", "seagull", "shampoo", "shark", "shelf", "shoe", "shop", "shower", "skeleton", "spanner", "sparrow", "specimen", "square", "squirrel", "star", "statue", "store", "strawberry", "sunday",
            "table", "taxi", "telephone", "throne", "thursday", "tissue", "toad", "tomato", "token", "toothbrush", "towel", "train", "tree", "troll", "truck", "tuesday", "turnip",
            "umbrella", "unicorn", "universe", "university",
            "vase", "vice", "village",
            "wednesday", "wheel", "window",
            "year",
            "zebra"
        };

        public static bool TryCreateToken(LotographiaContext context, out string token)
        {
            var attempts = 0;

            while (attempts < 8)
            {
                var adverbIndex = random.Next(Modifiers.Length);
                string adverb = null;

                while (adverb == null)
                {
                    adverb = Modifiers[adverbIndex].Item1;

                    if (adverb == null)
                        adverbIndex = random.Next(Modifiers.Length);
                }

                var adjectiveIndex = random.Next(Modifiers.Length);
                string adjective = null;

                while (adjective == null)
                {
                    if (adjectiveIndex != adverbIndex)
                        adjective = Modifiers[adjectiveIndex].Item2;

                    if (adjective == null)
                        adjectiveIndex = random.Next(Modifiers.Length);
                }
                
                var noun = Nouns[random.Next(Nouns.Length)];

                var newToken = $"{adverb}-{adjective}-{noun}";

                if (!context.MistletoeGames.Any(game => game.Token == newToken))
                {
                    token = newToken;
                    return true;
                }

                attempts++;
            }

            token = null;
            return false;
        }

        public static int Count()
        {
            var modifierCombinations = 0;

            for (var i = 0; i < Modifiers.Length; i++)
            {
                if (Modifiers[i].Item1 != null)
                {
                    for (var j = 0; j < Modifiers.Length; j++)
                    {
                        if (i != j && Modifiers[j].Item2 != null)
                        {
                            modifierCombinations++;
                        }
                    }
                }
            }

            return modifierCombinations * Nouns.Length;
        }
    }
}
