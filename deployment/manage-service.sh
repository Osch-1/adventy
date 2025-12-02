#!/bin/bash
# Service management script for Adventy
# Usage: ./manage-service.sh [start|stop|restart|status|logs|enable|disable]

set -e

SERVICE_NAME="adventy.service"
ACTION="${1:-status}"

case "$ACTION" in
    start)
        echo "Starting $SERVICE_NAME..."
        sudo systemctl start "$SERVICE_NAME"
        sudo systemctl status "$SERVICE_NAME" --no-pager
        ;;
    stop)
        echo "Stopping $SERVICE_NAME..."
        sudo systemctl stop "$SERVICE_NAME"
        echo "Service stopped"
        ;;
    restart)
        echo "Restarting $SERVICE_NAME..."
        sudo systemctl restart "$SERVICE_NAME"
        sudo systemctl status "$SERVICE_NAME" --no-pager
        ;;
    status)
        sudo systemctl status "$SERVICE_NAME" --no-pager
        ;;
    logs)
        echo "Showing logs for $SERVICE_NAME (Ctrl+C to exit)..."
        sudo journalctl -u "$SERVICE_NAME" -f
        ;;
    enable)
        echo "Enabling $SERVICE_NAME to start on boot..."
        sudo systemctl enable "$SERVICE_NAME"
        echo "Service enabled"
        ;;
    disable)
        echo "Disabling $SERVICE_NAME from starting on boot..."
        sudo systemctl disable "$SERVICE_NAME"
        echo "Service disabled"
        ;;
    install)
        echo "Installing $SERVICE_NAME..."
        if [ ! -f "deployment/$SERVICE_NAME" ]; then
            echo "Error: Service file not found at deployment/$SERVICE_NAME"
            exit 1
        fi
        sudo cp "deployment/$SERVICE_NAME" "/etc/systemd/system/"
        sudo systemctl daemon-reload
        sudo systemctl enable "$SERVICE_NAME"
        echo "Service installed and enabled"
        echo "Start it with: sudo systemctl start $SERVICE_NAME"
        ;;
    *)
        echo "Usage: $0 [start|stop|restart|status|logs|enable|disable|install]"
        echo ""
        echo "Commands:"
        echo "  start    - Start the service"
        echo "  stop     - Stop the service"
        echo "  restart  - Restart the service"
        echo "  status   - Show service status"
        echo "  logs     - Follow service logs"
        echo "  enable   - Enable service to start on boot"
        echo "  disable  - Disable service from starting on boot"
        echo "  install  - Install the service file"
        exit 1
        ;;
esac

