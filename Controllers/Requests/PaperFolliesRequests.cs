namespace Lotographia.Controllers.Requests
{
    public class CreateGameRequest
    {
        public GameAttributes GameAttributes { get; set; }
        public ParticipantAttributes ParticipantAttributes { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
    }

    public class CreateParticipantRequest
    {
        public long GameId { get; set; }
        public string GameCode { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public ParticipantAttributes ParticipantAttributes { get; set; }
    }

    public class LoginRequest
    {
        public long ParticipantId { get; set; }
        public string ParticipantPassword { get; set; }
    }

    public class GameAttributes
    {
        public bool CanSeePrecedingContent { get; set; }
        public bool CanSeeFollowingContent { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public bool ParticipantsHaveBiographies { get; set; }
        public bool AddPlayersManually { get; set; }
        public bool PlayersAreRandomlyOrdered { get; set; }
        public int CharacterLimit { get; set; }
    }

    public class ParticipantAttributes
    {
        public string Name { get; set; }
        public string Biography { get; set; }
        public bool IsPlayer { get; set; }
    }

    public class PutContentRequest
    {
        public string Content { get; set; }
    }
}
