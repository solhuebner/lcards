"""Config flow for LCARdS.

Single-instance only — LCARdS does not support multiple config entries.
The setup form is intentionally minimal: no user input required.
"""
from homeassistant import config_entries

from .const import DOMAIN


class LCARdSConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for LCARdS."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial step triggered from the integrations UI."""
        # Enforce single-instance constraint
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title="LCARdS", data={})

        return self.async_show_form(step_id="user")
