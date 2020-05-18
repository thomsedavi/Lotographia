using System;
using System.Text.Json.Serialization;

namespace Lotographia.Models
{
    public class MistletoePlayer
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Biography { get; set; }
        public MistletoePlayerSettings Settings { get; set; }
        public string Content { get; set; }
        public int Version { get; set; }

        [JsonIgnore]
        public string HashedPassword { get; set; }

        public int MistletoeGameId { get; set; }
        public MistletoeGame MistletoeGame { get; set; }

        public int? PrecedingPlayerId { get; set; }
        public MistletoePlayer PrecedingPlayer { get; set; }
        public int? FollowingPlayerId { get; set; }
        public MistletoePlayer FollowingPlayer { get; set; }
    }

    [Flags]
    public enum MistletoePlayerSettings
    {
        None = 0,
        IsOwner = 1 << 0,
        IsOwnerPlayer = 1 << 1,
        IsConfirmed = 1 << 2
    }
}
