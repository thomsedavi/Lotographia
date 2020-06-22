using System;
using System.Text.Json.Serialization;

namespace Lotographia.Models
{
    public class MistletoeParticipant
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Biography { get; set; }
        public MistletoeParticipantSettings Settings { get; set; }
        public string Content { get; set; }
        public int Version { get; set; }

        [JsonIgnore]
        public string HashedPassword { get; set; }

        public int MistletoeGameId { get; set; }
        public MistletoeGame MistletoeGame { get; set; }

        public int? PrecedingPlayerId { get; set; }
        public MistletoeParticipant PrecedingPlayer { get; set; }
        public int? FollowingPlayerId { get; set; }
        public MistletoeParticipant FollowingPlayer { get; set; }
    }

    [Flags]
    public enum MistletoeParticipantSettings
    {
        None = 0,
        IsAdmin = 1 << 0,
        IsApprovedPlayer = 1 << 1
    }
}
