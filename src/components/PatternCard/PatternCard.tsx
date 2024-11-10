import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { Close, Refresh, Check } from '@mui/icons-material';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { type Pattern, ResponseTypeEnum, ResponseEnum } from '@/types/strapi';
import {
  categoryDisplayNames,
  categoryColors,
  categoryIcons,
  phaseDisplayNames,
} from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import useStartupPattern from '@/hooks/useStartupPattern';
import { useAuth } from '@/hooks/useAuth';

interface ActionDialogProps {
  open: boolean;
  onClose: () => void;
  nextUrl: string;
  pattern: Pattern;
  responseType: ResponseTypeEnum;
  title: string;
  actions: [string, ResponseEnum][];
}

const ActionDialog: React.FC<ActionDialogProps> = ({
  open,
  onClose,
  nextUrl,
  pattern,
  responseType,
  title,
  actions,
}) => {
  const { startup } = useAuth();
  const navigate = useNavigate();
  const { createStartupPattern, startupPattern } = useStartupPattern();
  const [response, setResponse] = React.useState<ResponseEnum | null>(null);

  useEffect(() => {
    if (response) {
      createStartupPattern({
        startup: { set: { documentId: startup?.documentId as string } },
        pattern: { set: { documentId: pattern.documentId } },
        responseType,
        response,
      });
    }
  }, [response, createStartupPattern, pattern, responseType, startup]);

  useEffect(() => {
    if (response && startupPattern) {
      if (responseType === ResponseTypeEnum.accept) {
        switch (response) {
          case ResponseEnum.share_reflection:
            navigate(`/progress/${pattern.documentId}/survey`, { state: { nextUrl } });
            return;
          case ResponseEnum.perform_exercise:
            navigate(`/progress/${pattern.documentId}/exercise`, { state: { nextUrl } });
            return;
          case ResponseEnum.think_later:
            break;
          default:
            break;
        }
      } else if (responseType === ResponseTypeEnum.reject) {
        switch (response) {
          case ResponseEnum.already_addressed:
            break;
          case ResponseEnum.maybe_later:
            break;
          case ResponseEnum.no_value:
            break;
          case ResponseEnum.dont_understand:
            break;
          default:
            break;
        }
      }
      navigate(nextUrl);
    }
  }, [response, startupPattern, navigate, pattern, nextUrl, responseType]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-2 py-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              fullWidth
              variant="contained"
              color={responseType === ResponseTypeEnum.accept ? 'success' : 'error'}
              onClick={() => {
                setResponse(action[1]);
                onClose();
              }}
              sx={{ mt: 1 }}
            >
              {action[0]}
            </Button>
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Back</Button>
      </DialogActions>
    </Dialog>
  );
};

interface PatternCardProps {
  pattern: Pattern;
  nextUrl: string;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, nextUrl }) => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogConfig, setDialogConfig] = React.useState<{
    responseType: ResponseTypeEnum;
    title: string;
    actions: [string, ResponseEnum][];
  }>({ responseType: ResponseTypeEnum.accept, title: '', actions: [] });
  const [isVisible, setIsVisible] = React.useState(true);
  const [exitDirection, setExitDirection] = React.useState<'left' | 'right' | null>(null);

  const handleSwipe = (direction: 'left' | 'right') => {
    setExitDirection(direction);
    setIsVisible(false);

    // Delay dialog opening until after exit animation
    setTimeout(() => {
      if (direction === 'right') {
        setDialogConfig({
          responseType: ResponseTypeEnum.accept,
          title: 'Great! What would you like to do?',
          actions: [
            ['Share reflection', ResponseEnum.share_reflection],
            ['Perform exercise', ResponseEnum.perform_exercise],
            ['Think about it later', ResponseEnum.think_later],
          ],
        });
      } else {
        setDialogConfig({
          responseType: ResponseTypeEnum.reject,
          title: 'Why are you passing?',
          actions: [
            ['Already addressed', ResponseEnum.already_addressed],
            ['Maybe later', ResponseEnum.maybe_later],
            ["Can't see value", ResponseEnum.no_value],
            ["Don't get it", ResponseEnum.dont_understand],
          ],
        });
      }
      setDialogOpen(true);
    }, 100); // Match this with animation duration
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const SWIPE_THRESHOLD = 100;

    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      // Determine swipe direction and trigger exit
      const direction = info.offset.x > 0 ? 'right' : 'left';
      handleSwipe(direction);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setExitDirection(null);
    setIsVisible(true);
    setIsFlipped(false);
  };

  const cardFront = (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        borderRadius: '16px',
        backfaceVisibility: 'hidden',
        margin: 0,
        padding: 0,
      }}
    >
      <Box
        sx={{
          bgcolor: categoryColors[pattern.category] || '#grey',
          p: 2,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" color="white">
          {categoryDisplayNames[pattern.category]}
        </Typography>
        <Typography variant="h5" color="white">
          {categoryIcons[pattern.category]}
        </Typography>
      </Box>
      <CardMedia
        sx={{
          height: '30%',
          overflow: 'hidden',
          bgcolor: 'grey.100',
          position: 'relative',
          '& img': {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          },
        }}
      >
        {pattern.image ? (
          <img src={`https://api.di.sce.de${pattern.image.url}`} alt={''} />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ImageIcon
              sx={{
                fontSize: 48,
                color: 'grey.300',
              }}
            />
          </Box>
        )}
      </CardMedia>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h4"
          gutterBottom
          textAlign="center"
          color={categoryColors[pattern.category]}
        >
          {pattern.name}
        </Typography>
        {pattern.relatedPatterns && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '80px',
              display: 'flex',
              flexDirection: 'row',
              columnGap: 1,
              rowGap: 0.1,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="body2" color={categoryColors[pattern.category]} fontWeight="bold">
              Related Patterns:
            </Typography>
            {pattern.relatedPatterns.map((relPattern, index) => (
              <>
                <Typography
                  key={relPattern.name}
                  component="a"
                  variant="body2"
                  onClick={() => navigate(`/explore/${relPattern.documentId}`)}
                  mx="0"
                  color="black"
                  fontStyle="italic"
                  sx={{
                    cursor: 'pointer',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {relPattern.name}
                </Typography>
                {index !== pattern.relatedPatterns.length - 1 && (
                  <Typography variant="body2">–</Typography>
                )}
              </>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
  const cardBack = (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        backfaceVisibility: 'hidden',
        borderRadius: '16px',
        transform: 'rotateY(180deg)',
      }}
    >
      <Box
        sx={{
          bgcolor: categoryColors[pattern.category] || '#grey',
          p: 2,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" color="white">
          {categoryDisplayNames[pattern.category]}
        </Typography>
        <Typography variant="h5" color="white">
          {categoryIcons[pattern.category]}
        </Typography>
      </Box>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          {pattern.name}
        </Typography>
        <Typography variant="body1">{pattern.description}</Typography>
        <Box
          sx={{
            position: 'absolute',
            bottom: '80px',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mt={2}>
            <Stack direction="row" spacing={0.5}>
              {pattern.phases.map((phase) => (
                <Chip
                  key={phase}
                  label={phaseDisplayNames[phase]}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );

  const variants = {
    enter: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -1000 : 1000,
      opacity: 0,
      scale: 0.5,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
  };

  const cardContainer = isVisible && (
    <motion.div
      key="card-container"
      initial="enter"
      animate="center"
      exit="exit"
      variants={variants}
      custom={exitDirection}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {cardFront}
        {cardBack}
      </motion.div>
    </motion.div>
  );

  return (
    <Box
      sx={{
        perspective: '1000px',
        height: '100%',
        maxWidth: '100%',
        aspectRatio: '2/3',
        mx: 'auto',
        position: 'relative',
        touchAction: 'pan-y',
      }}
    >
      <AnimatePresence mode="wait" custom={exitDirection}>
        {cardContainer}
      </AnimatePresence>

      {/* Only show buttons if card is visible */}
      {isVisible && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-around',
            px: 2,
            zIndex: 1,
          }}
        >
          <IconButton color="error" onClick={() => handleSwipe('left')} size="large">
            <Close />
          </IconButton>
          <IconButton onClick={() => setIsFlipped(!isFlipped)} size="large">
            <Refresh />
          </IconButton>
          <IconButton color="success" onClick={() => handleSwipe('right')} size="large">
            <Check />
          </IconButton>
        </Box>
      )}

      <ActionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        nextUrl={nextUrl}
        pattern={pattern}
        responseType={dialogConfig.responseType}
        title={dialogConfig.title}
        actions={dialogConfig.actions}
      />
    </Box>
  );
};

export default PatternCard;
