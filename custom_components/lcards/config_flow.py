"""Config flow for LCARdS.

Single-instance only — LCARdS does not support multiple config entries.
The initial setup form requires no user input.

Post-install options (sidebar panel visibility, etc.) are surfaced via the
"Configure" button on the integration card, handled by LCARdSOptionsFlow.
"""
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback

from .const import DOMAIN, CONF_SHOW_PANEL, DEFAULT_SHOW_PANEL


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

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Return the options flow handler."""
        return LCARdSOptionsFlow()


class LCARdSOptionsFlow(config_entries.OptionsFlow):
    """Handle LCARdS options (accessible via Configure on the integration card)."""

    async def async_step_init(self, user_input=None):
        """Show the options form."""
        if user_input is not None:
            return self.async_create_entry(data=user_input)

        current_show = self.config_entry.options.get(
            CONF_SHOW_PANEL, DEFAULT_SHOW_PANEL
        )

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_SHOW_PANEL, default=current_show): bool,
                }
            ),
        )
