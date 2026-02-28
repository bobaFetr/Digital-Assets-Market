# ====== Build Frontend (Vite + React) ======
FROM node:20-alpine AS frontend-build
WORKDIR /src/frontend

# Copy only frontend package files first for caching
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of frontend
COPY frontend/ ./
RUN npm run build   # outputs to /src/frontend/dist

# ====== Build Backend (.NET 8 Web API) ======
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src

# Copy csproj files and restore first (for caching)
COPY backend/MyWebApi/MyWebApi.csproj MyWebApi/
COPY backend/NetServer.DAta1/NetServer.DAta1.csproj NetServer.DAta1/
RUN dotnet restore MyWebApi/MyWebApi.csproj

# Copy the full backend source
COPY backend/ ./

# Copy frontend build into wwwroot
COPY --from=frontend-build /src/frontend/dist ./MyWebApi/wwwroot

# Publish backend
RUN dotnet publish MyWebApi/MyWebApi.csproj -c Release -o /app/publish

# ====== Final Runtime Image ======
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Expose port from Render
EXPOSE 10000

# Copy published backend
COPY --from=backend-build /app/publish .

# Run with dynamic port
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-10000} dotnet MyWebApi.dll"]
