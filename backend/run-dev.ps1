$repoRoot = Resolve-Path "$PSScriptRoot\..\.."
$localJdk = Join-Path $repoRoot "tri-consumer\.jdks\temurin-17"

if (Test-Path $localJdk) {
    $env:JAVA_HOME = $localJdk
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
    Write-Host "Using repository-specific Java 17 JDK: $localJdk"
} else {
    Write-Warning "Repository-specific Java 17 JDK not found at $localJdk. Using system default Java version."
}

Set-Location $PSScriptRoot
mvn spring-boot:run
