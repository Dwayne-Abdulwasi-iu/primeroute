# Wait for server to be ready
Start-Sleep -Seconds 3

$adminEmail = $env:PRIMEROUTE_ADMIN_EMAIL
$adminPassword = $env:PRIMEROUTE_ADMIN_PASSWORD
$adminKey = $env:PRIMEROUTE_ADMIN_KEY
$apiUrl = $env:PRIMEROUTE_API_URL
if ([string]::IsNullOrWhiteSpace($apiUrl)) {
    $apiUrl = "http://localhost:3002"
}
if ([string]::IsNullOrWhiteSpace($adminEmail) -or [string]::IsNullOrWhiteSpace($adminPassword) -or [string]::IsNullOrWhiteSpace($adminKey)) {
    throw "Set PRIMEROUTE_ADMIN_EMAIL, PRIMEROUTE_ADMIN_PASSWORD, and PRIMEROUTE_ADMIN_KEY before running this script."
}

$body = @{
    firstName = "Admin"
    lastName = "User"
    email = $adminEmail
    password = $adminPassword
    phone = "+1234567890"
    address = @{
        street = "123 Admin St"
        city = "Admin City"
        state = "NY"
        zipCode = "12345"
    }
    adminKey = $adminKey
} | ConvertTo-Json -Depth 3

try {
    Write-Host "Creating admin user..."
    $response = Invoke-RestMethod -Uri "$($apiUrl.TrimEnd('/'))/api/auth/register-admin" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Admin user created successfully!"
    Write-Host "📧 Email: $adminEmail"
    Write-Host ""
    Write-Host "Now you can:"
    Write-Host "1. Log out of your current account"
    Write-Host "2. Log in with the admin email and password supplied securely via environment variables"
    Write-Host "3. Access the customer support platform"
} catch {
    Write-Host "❌ Error creating admin user:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Server response: $responseBody"
    }
}