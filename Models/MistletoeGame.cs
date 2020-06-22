using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Lotographia.Models
{
    public class MistletoeGame
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public MistletoeGameSettings Settings { get; set; }
        public int CharacterLimit { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? EndedDate { get; set; }

        [JsonIgnore]
        public List<MistletoeParticipant> MistletoeParticipants { get; } = new List<MistletoeParticipant>();
    }

    [Flags]
    public enum MistletoeGameSettings
    {
        None = 0,
        CanSeePreviousContent = 1 << 0,
        CanSeeNextContent = 1 << 1,
        IsStarted = 1 << 2,
        IsEnding = 1 << 3,
        IsEnded = 1 << 4,
        PlayersRequireApproval = 1 << 5,
        ParticipantsHaveBiographies = 1 << 6,
        AdminIsPlayer = 1 << 7,
        RandomlyOrderPlayers = 1 << 8
    }
}
