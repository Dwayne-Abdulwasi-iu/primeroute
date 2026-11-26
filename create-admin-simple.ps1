Write-Host "Creating admin user..."

$adminEmail = $env:PRIMEROUTE_ADMIN_EMAIL
$adminPassword = $env:PRIMEROUTE_ADMIN_PASSWORD
$adminKey = $env:PRIMEROUTE_ADMIN_KEY
$apiUrl = $env:PRIMEROUTE_API_URL
if ([string]::IsNullOrWhiteSpace($adminEmail) -or [string]::IsNullOrWhiteSpace($adminPassword) -or [string]::IsNullOrWhiteSpace($adminKey) -or [string]::IsNullOrWhiteSpace($apiUrl)) {
    throw "Set PRIMEROUTE_API_URL, PRIMEROUTE_ADMIN_EMAIL, PRIMEROUTE_ADMIN_PASSWORD, and PRIMEROUTE_ADMIN_KEY before running this script."
}

$adminData = @{
    firstName = "Admin"
    lastName = "User"
    email = $adminEmail
    password = $adminPassword
    phone = "+1234567890"
    address = @{
        street = "123 Admin Street"
        city = "New York"
        state = "NY"
        zipCode = "10001"
    }
    adminKey = $adminKey
}

$json = $adminData | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$($apiUrl.TrimEnd('/'))/api/auth/register-admin" -Method POST -Body $json -ContentType "application/json"

    Write-Host ""
    Write-Host "✅ Admin user created successfully!"
    Write-Host "Email: $adminEmail"
    Write-Host ""
    Write-Host "Login at: $apiUrl"

} catch {
    Write-Host "Error: $($_.Exception.Message)"
}