# Backend build (.NET 8 Web API) - builds only the backend service
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj files for restore (cache-friendly)
COPY MyWebApi/MyWebApi.csproj MyWebApi/
COPY NetServer.DAta1/NetServer.DAta1.csproj NetServer.DAta1/
RUN dotnet restore MyWebApi/MyWebApi.csproj

# copy backend sources
COPY MyWebApi/ MyWebApi/
COPY NetServer.DAta1/ NetServer.DAta1/

# publish backend
RUN dotnet publish MyWebApi/MyWebApi.csproj -c Release -o /app/publish

# Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 10000
COPY --from=build /app/publish .
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-10000} dotnet MyWebApi.dll"]
