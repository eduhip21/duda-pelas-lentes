using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DudaPelasLentes.Api.Controllers.Admin;

[ApiController]
[Authorize(Policy = "Admin")]
[Produces("application/json")]
public abstract class AdminControllerBase : ControllerBase;
