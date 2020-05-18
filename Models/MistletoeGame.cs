using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Lotographia.Models
{
    public class MistletoeGame
    {
        public int Id { get; set; }
        public string Token { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public MistletoeGameSettings Settings { get; set; }
        public int CharacterLimit { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? PublishedDate { get; set; }

        [JsonIgnore]
        public List<MistletoePlayer> MistletoePlayers { get; } = new List<MistletoePlayer>();
    }

    [Flags]
    public enum MistletoeGameSettings
    {
        None = 0,
        CanSeePreviousContent = 1 << 0,
        CanSeeNextContent = 1 << 1,
        IsStarted = 1 << 2,
        IsEnding = 1 << 3,
        IsPublished = 1 << 4,
        RequiresConfirmation = 1 << 5
    }
}
