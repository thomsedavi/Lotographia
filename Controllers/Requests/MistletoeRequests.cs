namespace Lotographia.Controllers.Requests
{
    public class CreateGameRequest
    {
        public string GameTitle { get; set; }
        public int GameCharacterLimit { get; set; }
        public string GameDescription { get; set; }
        public bool CanSeePreviousContent { get; set; }
        public bool CanSeeNextContent { get; set; }
        public bool AdminIsPlayer { get; set; }
        public string ParticipantName { get; set; }
        public string ParticipantPassword { get; set; }
        public string ParticipantConfirmPassword { get; set; }
        public bool ParticipantsHaveBiographies { get; set; }
        public string ParticipantBiography { get; set; }
        public bool PlayersRequireApproval { get; set; }
        public bool RandomlyOrderPlayers { get; set; }
    }

    public class CreatePlayerRequest
    {
        public int GameId { get; set; }
        public string GameCode { get; set; }
        public string PlayerName { get; set; }
        public string PlayerPassword { get; set; }
        public string PlayerConfirmPassword { get; set; }
        public string PlayerBiography { get; set; }
    }

    public class LoginRequest
    {
        public int ParticipantId { get; set; }
        public string ParticipantPassword { get; set; }
    }
}
