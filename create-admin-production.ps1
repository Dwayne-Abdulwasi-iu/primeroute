# Create Admin Account for Production Render Deployment

$adminEmail = $env:PRIMEROUTE_ADMIN_EMAIL
$adminPassword = $env:PRIMEROUTE_ADMIN_PASSWORD
$adminKey = $env:PRIMEROUTE_ADMIN_KEY
$apiUrl = $env:PRIMEROUTE_API_URL
if ([string]::IsNullOrWhiteSpace($adminEmail) -or [string]::IsNullOrWhiteSpace($adminPassword) -or [string]::IsNullOrWhiteSpace($adminKey) -or [string]::IsNullOrWhiteSpace($apiUrl)) {
    throw "Set PRIMEROUTE_API_URL, PRIMEROUTE_ADMIN_EMAIL, PRIMEROUTE_ADMIN_PASSWORD, and PRIMEROUTE_ADMIN_KEY before running this script."
}

$body = @{
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
} | ConvertTo-Json -Depth 3

try {
    Write-Host "Creating admin user on production server..."
    Write-Host "Server: $apiUrl"

    $response = Invoke-RestMethod -Uri "$($apiUrl.TrimEnd('/'))/api/auth/register-admin" -Method POST -Body $body -ContentType "application/json"

    Write-Host ""
    Write-Host "✅ Admin user created successfully!"
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "📧 Email: $adminEmail"
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host ""
    Write-Host "🚀 Access your admin panel:"
    Write-Host "1. Go to: $apiUrl"
    Write-Host "2. Click 'Login' in the navigation"
    Write-Host "3. Use the credentials supplied securely via environment variables"
    Write-Host "4. Click 'Admin Login' to access the admin dashboard"
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Change the password after first login!"

} catch {
    Write-Host "❌ Error creating admin user:"
    Write-Host $_.Exception.Message

    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Server response: $responseBody"
    }

    Write-Host ""
    Write-Host "💡 Troubleshooting:"
    Write-Host "- Make sure the server is running at $apiUrl"
    Write-Host "- Check if admin account already exists"
    Write-Host "- Verify the ADMIN_KEY matches in your environment variables"
}