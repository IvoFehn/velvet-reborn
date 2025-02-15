// components/EventCard.tsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Chip,
  useMediaQuery,
  Theme,
} from "@mui/material";
import { Edit, Delete, Repeat } from "@mui/icons-material";
import { IEvent } from "@/models/Event";

interface EventCardProps {
  event: IEvent;
  onEdit: () => void;
  onDelete: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  return (
    <Card sx={{ mb: 2, boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="h6" gutterBottom>
              {event.title}
              {event.recurring && (
                <Chip
                  label="Wiederkehrend"
                  color="primary"
                  size="small"
                  icon={<Repeat fontSize="small" />}
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {event.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Start: {new Date(event.startDate).toLocaleString()}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Ende: {new Date(event.endDate).toLocaleString()}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ textAlign: isMobile ? "left" : "right" }}
          >
            <IconButton
              onClick={onEdit}
              color="primary"
              aria-label="Bearbeiten"
            >
              <Edit />
            </IconButton>
            <IconButton onClick={onDelete} color="error" aria-label="Löschen">
              <Delete />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EventCard;
