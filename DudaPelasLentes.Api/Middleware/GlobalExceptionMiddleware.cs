using System.Text.Json;
using DudaPelasLentes.Api.Services;

namespace DudaPelasLentes.Api.Middleware;

/// <summary>Tratamento global de erros. Nunca expõe stack trace fora de Development.</summary>
public sealed class GlobalExceptionMiddleware(
    RequestDelegate next,
    IHostEnvironment env,
    ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ImageValidationException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status400BadRequest, "Upload inválido", ex.Message);
        }
        catch (BadHttpRequestException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status400BadRequest, "Requisição inválida", ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro não tratado em {Path}", context.Request.Path);
            var detail = env.IsDevelopment() ? ex.Message : "Ocorreu um erro inesperado. Tente novamente.";
            await WriteProblemAsync(context, StatusCodes.Status500InternalServerError, "Erro interno", detail);
        }
    }

    private static async Task WriteProblemAsync(HttpContext ctx, int status, string title, string detail)
    {
        if (ctx.Response.HasStarted)
            return;

        ctx.Response.Clear();
        ctx.Response.StatusCode = status;
        ctx.Response.ContentType = "application/problem+json";

        var payload = JsonSerializer.Serialize(new
        {
            type = $"https://httpstatuses.io/{status}",
            title,
            status,
            detail
        });

        await ctx.Response.WriteAsync(payload);
    }
}
