resource "aws_apigatewayv2_api" "cli_websocket_signalling_server" {
  name                       = "cli_websocket_signalling_server"
  protocol_type              = "WEBSOCKET"
}

output "api_url" {
  value = aws_apigatewayv2_api.cli_websocket_signalling_server.api_endpoint
}